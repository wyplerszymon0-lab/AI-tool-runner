import { describe, it, expect } from "vitest"
import { calculatorTool, weatherTool, searchTool, unitConverterTool } from "../src/tools"

describe("calculatorTool", () => {
  it("adds two numbers", async () => {
    const result = await calculatorTool.execute({ operation: "add", a: 3, b: 4 })
    expect(result).toBe(7)
  })

  it("subtracts two numbers", async () => {
    const result = await calculatorTool.execute({ operation: "subtract", a: 10, b: 3 })
    expect(result).toBe(7)
  })

  it("multiplies two numbers", async () => {
    const result = await calculatorTool.execute({ operation: "multiply", a: 6, b: 7 })
    expect(result).toBe(42)
  })

  it("divides two numbers", async () => {
    const result = await calculatorTool.execute({ operation: "divide", a: 10, b: 2 })
    expect(result).toBe(5)
  })

  it("throws on division by zero", async () => {
    await expect(calculatorTool.execute({ operation: "divide", a: 10, b: 0 }))
      .rejects.toThrow("Division by zero")
  })

  it("computes power", async () => {
    const result = await calculatorTool.execute({ operation: "power", a: 2, b: 10 })
    expect(result).toBe(1024)
  })

  it("computes sqrt", async () => {
    const result = await calculatorTool.execute({ operation: "sqrt", a: 16 })
    expect(result).toBe(4)
  })

  it("throws on unknown operation", async () => {
    await expect(calculatorTool.execute({ operation: "modulo", a: 10, b: 3 }))
      .rejects.toThrow("Unknown operation")
  })
})

describe("weatherTool", () => {
  it("returns weather data for known city", async () => {
    const result = await weatherTool.execute({ city: "Wroclaw" }) as any
    expect(result).toHaveProperty("city", "Wroclaw")
    expect(result).toHaveProperty("temperature")
    expect(result).toHaveProperty("condition")
    expect(result.temperature).toBe(18)
  })

  it("converts to fahrenheit", async () => {
    const result = await weatherTool.execute({ city: "Wroclaw", unit: "fahrenheit" }) as any
    expect(result.unit).toBe("fahrenheit")
    expect(result.temperature).toBeGreaterThan(50)
  })

  it("returns data for unknown city", async () => {
    const result = await weatherTool.execute({ city: "Unknown" }) as any
    expect(result).toHaveProperty("temperature")
    expect(result).toHaveProperty("condition")
  })
})

describe("searchTool", () => {
  it("returns results for a query", async () => {
    const result = await searchTool.execute({ query: "machine learning" }) as any[]
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(3)
  })

  it("respects limit parameter", async () => {
    const result = await searchTool.execute({ query: "python", limit: 2 }) as any[]
    expect(result.length).toBe(2)
  })

  it("includes query in results", async () => {
    const query  = "typescript"
    const result = await searchTool.execute({ query }) as any[]
    expect(result[0].title).toContain(query)
  })

  it("returns results sorted by relevance", async () => {
    const result = await searchTool.execute({ query: "go lang" }) as any[]
    const relevances = result.map((r: any) => r.relevance)
    expect(relevances[0]).toBeGreaterThan(relevances[1])
  })
})

describe("unitConverterTool", () => {
  it("converts km to miles", async () => {
    const result = await unitConverterTool.execute({ value: 100, from: "km", to: "miles" }) as any
    expect(result.result).toBeCloseTo(62.1371, 2)
  })

  it("converts kg to lbs", async () => {
    const result = await unitConverterTool.execute({ value: 10, from: "kg", to: "lbs" }) as any
    expect(result.result).toBeCloseTo(22.0462, 2)
  })

  it("converts celsius to fahrenheit", async () => {
    const result = await unitConverterTool.execute({ value: 0, from: "celsius", to: "fahrenheit" }) as any
    expect(result.result).toBe(32)
  })

  it("converts fahrenheit to celsius", async () => {
    const result = await unitConverterTool.execute({ value: 212, from: "fahrenheit", to: "celsius" }) as any
    expect(result.result).toBe(100)
  })

  it("throws on unknown conversion", async () => {
    await expect(unitConverterTool.execute({ value: 1, from: "parsec", to: "km" }))
      .rejects.toThrow("Cannot convert")
  })
})
