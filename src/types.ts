export interface Tool {
  name: string
  description: string
  parameters: Record<string, ParameterSchema>
  execute(params: Record<string, unknown>): Promise<unknown>
}

export interface ParameterSchema {
  type: "string" | "number" | "boolean" | "array" | "object"
  description: string
  required?: boolean
  enum?: unknown[]
}

export interface ToolCall {
  name: string
  parameters: Record<string, unknown>
}

export interface ToolResult {
  toolName: string
  success: boolean
  result?: unknown
  error?: string
  durationMs: number
}

export interface RunResult {
  reply: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  totalTokens: number
  iterations: number
}
