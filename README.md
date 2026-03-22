# ai-tool-runner

An AI agent with OpenAI function calling. The agent decides which tools to use, calls them automatically and incorporates results into its reply.

## Tools

| Tool | Description |
|---|---|
| `calculator` | Add, subtract, multiply, divide, power, sqrt |
| `get_weather` | Current weather for any city |
| `search` | Knowledge base search |
| `convert_units` | km↔miles, kg↔lbs, celsius↔fahrenheit, liters↔gallons |

## How It Works
```
User message
      ↓
OpenAI decides which tools to call
      ↓
ToolRunner executes each tool
      ↓
Results injected back into context
      ↓
OpenAI generates final reply
```

## Run
```bash
npm install
export OPENAI_API_KEY=your_key
npm run dev
```

## Example prompts
```
What is 2 to the power of 16?
What is the weather in Wroclaw?
Convert 100 km to miles
Search for information about neural networks
What is 15% of 840?
```

## Test
```bash
npm test
```

## Project Structure
```
ai-tool-runner/
├── src/
│   ├── index.ts      # CLI entry point
│   ├── runner.ts     # ToolRunner — orchestrates tool calls
│   ├── tools.ts      # Calculator, weather, search, converter
│   └── types.ts      # Interfaces and types
├── tests/
│   └── tools.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Author

**Szymon Wypler** 
