import { Tool } from "./types"

export const calculatorTool: Tool = {
  name: "calculator",
  description: "Performs arithmetic operations — add, subtract, multiply, divide, power, sqrt",
  parameters: {
    operation: {
      type: "string",
      description: "The operation to perform",
      required: true,
      enum: ["add", "subtract", "multiply", "divide", "power", "sqrt"],
    },
    a: {
      type: "number",
      description: "First operand",
      required: true,
    },
    b: {
      type: "number",
      description: "Second operand (not required for sqrt)",
      required: false,
    },
  },
  async execute(params) {
    const { operation, a, b } = params as { operation: string; a: number; b?: number }

    switch (operation) {
      case "add":      return a + (b ?? 0)
      case "subtract": return a - (b ?? 0)
      case "multiply": return a * (b ?? 1)
      case "divide":
        if (b === 0) throw new Error("Division by zero")
        return a / (b ?? 1)
      case "power":    return Math.pow(a, b ?? 2)
      case "sqrt":     return Math.sqrt(a)
      default:         throw new Error(`Unknown operation: ${operation}`)
    }
  },
}

export const weatherTool: Tool = {
  name: "get_weather",
  description: "Gets the current weather for a city (simulated)",
  parameters: {
    city: {
      type: "string",
      description: "The city name",
      required: true,
    },
    unit: {
      type: "string",
      description: "Temperature unit",
      required: false,
      enum: ["celsius", "fahrenheit"],
    },
  },
  async execute(params) {
    const { city, unit = "celsius" } = params as { city: string; unit?: string }
    const temps: Record<string, number> = {
      wroclaw: 18,
      warsaw:  15,
      london:  12,
      berlin:  16,
      paris:   20,
    }

    const baseTempC = temps[city.toLowerCase()] ?? Math.floor(Math.random() * 25)
    const temp = unit === "fahrenheit" ? baseTempC * 9 / 5 + 32 : baseTempC
    const conditions = ["sunny", "cloudy", "rainy", "partly cloudy"]
    const condition  = conditions[Math.floor(Math.random() * conditions.length)]

    return {
      city,
      temperature: temp,
      unit,
      condition,
      humidity: Math.floor(Math.random() * 40 + 40),
      wind_kph: Math.floor(Math.random() * 30 + 5),
    }
  },
}

export const searchTool: Tool = {
  name: "search",
  description: "Searches a knowledge base for information on a topic (simulated)",
  parameters: {
    query: {
      type: "string",
      description: "The search query",
      required: true,
    },
    limit: {
      type: "number",
      description: "Maximum number of results to return",
      required: false,
    },
  },
  async execute(params) {
    const { query, limit = 3 } = params as { query: string; limit?: number }
    const results = [
      { title: `Introduction to ${query}`, snippet: `${query} is a fundamental concept in modern computing...`, relevance: 0.95 },
      { title: `Advanced ${query} techniques`, snippet: `Building on basic ${query} principles, advanced techniques include...`, relevance: 0.87 },
      { title: `${query} best practices`, snippet: `When working with ${query}, always consider performance and maintainability...`, relevance: 0.82 },
      { title: `History of ${query}`, snippet: `The concept of ${query} was first introduced in the early days of computing...`, relevance: 0.75 },
      { title: `${query} in production`, snippet: `Running ${query} in production environments requires careful consideration...`, relevance: 0.71 },
    ]
    return results.slice(0, limit)
  },
}

export const unitConverterTool: Tool = {
  name: "convert_units",
  description: "Converts between different units of measurement",
  parameters: {
    value: {
      type: "number",
      description: "The value to convert",
      required: true,
    },
    from: {
      type: "string",
      description: "Source unit (km, miles, kg, lbs, celsius, fahrenheit, liters, gallons)",
      required: true,
    },
    to: {
      type: "string",
      description: "Target unit",
      required: true,
    },
  },
  async execute(params) {
    const { value, from, to } = params as { value: number; from: string; to: string }
    const conversions: Record<string, Record<string, number>> = {
      km:         { miles: 0.621371 },
      miles:      { km: 1.60934 },
      kg:         { lbs: 2.20462 },
      lbs:        { kg: 0.453592 },
      liters:     { gallons: 0.264172 },
      gallons:    { liters: 3.78541 },
      celsius:    { fahrenheit: (v: number) => v * 9 / 5 + 32 } as any,
      fahrenheit: { celsius: (v: number) => (v - 32) * 5 / 9 } as any,
    }

    const conv = conversions[from.toLowerCase()]?.[to.toLowerCase()]
    if (!conv) throw new Error(`Cannot convert from ${from} to ${to}`)

    const result = typeof conv === "function" ? conv(value) : value * conv
    return { value, from, to, result: Math.round(result * 10000) / 10000 }
  },
}

export const defaultTools = [
  calculatorTool,
  weatherTool,
  searchTool,
  unitConverterTool,
]
