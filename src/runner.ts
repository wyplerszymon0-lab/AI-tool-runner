import OpenAI from "openai"
import { Tool, ToolCall, ToolResult, RunResult } from "./types"

function buildToolSchema(tool: Tool): OpenAI.Chat.ChatCompletionTool {
  const properties: Record<string, object> = {}
  const required: string[] = []

  for (const [name, schema] of Object.entries(tool.parameters)) {
    properties[name] = {
      type: schema.type,
      description: schema.description,
      ...(schema.enum ? { enum: schema.enum } : {}),
    }
    if (schema.required) required.push(name)
  }

  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties,
        required,
      },
    },
  }
}

export class ToolRunner {
  private client: OpenAI
  private tools: Map<string, Tool>
  private maxIterations: number
  private model: string

  constructor(apiKey: string, tools: Tool[], options: { maxIterations?: number; model?: string } = {}) {
    this.client        = new OpenAI({ apiKey })
    this.tools         = new Map(tools.map(t => [t.name, t]))
    this.maxIterations = options.maxIterations ?? 5
    this.model         = options.model ?? "gpt-4o-mini"
  }

  async run(userMessage: string): Promise<RunResult> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful assistant with access to tools. Use them when needed to answer questions accurately." },
      { role: "user",   content: userMessage },
    ]

    const toolSchemas = [...this.tools.values()].map(buildToolSchema)
    const allToolCalls: ToolCall[]   = []
    const allToolResults: ToolResult[] = []
    let totalTokens = 0
    let iterations  = 0

    while (iterations < this.maxIterations) {
      iterations++

      const response = await this.client.chat.completions.create({
        model:    this.model,
        messages,
        tools:    toolSchemas,
        tool_choice: "auto",
      })

      totalTokens += response.usage?.total_tokens ?? 0

      const message = response.choices[0]?.message
      if (!message) break

      messages.push(message)

      if (response.choices[0]?.finish_reason === "stop" || !message.tool_calls?.length) {
        return {
          reply:       message.content ?? "",
          toolCalls:   allToolCalls,
          toolResults: allToolResults,
          totalTokens,
          iterations,
        }
      }

      for (const toolCall of message.tool_calls) {
        const { name, arguments: args } = toolCall.function
        const params = JSON.parse(args)

        allToolCalls.push({ name, parameters: params })

        const result = await this.executeTool(toolCall.id, name, params)
        allToolResults.push(result)

        messages.push({
          role:         "tool",
          tool_call_id: toolCall.id,
          content:      JSON.stringify(result.success ? result.result : { error: result.error }),
        })
      }
    }

    return {
      reply:       "Max iterations reached",
      toolCalls:   allToolCalls,
      toolResults: allToolResults,
      totalTokens,
      iterations,
    }
  }

  private async executeTool(id: string, name: string, params: Record<string, unknown>): Promise<ToolResult> {
    const tool  = this.tools.get(name)
    const start = Date.now()

    if (!tool) {
      return { toolName: name, success: false, error: `Unknown tool: ${name}`, durationMs: 0 }
    }

    try {
      const result = await tool.execute(params)
      return { toolName: name, success: true, result, durationMs: Date.now() - start }
    } catch (err) {
      return {
        toolName:   name,
        success:    false,
        error:      err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      }
    }
  }

  addTool(tool: Tool): void {
    this.tools.set(tool.name, tool)
  }

  removeTool(name: string): boolean {
    return this.tools.delete(name)
  }

  listTools(): string[] {
    return [...this.tools.keys()]
  }
}
