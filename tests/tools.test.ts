import { createTools } from "../src/tools";
import { InwxClient } from "../src/client";
import { vi, type Mock } from 'vitest'

vi.mock("../src/client", () => {
  return {
    InwxClient: vi.fn().mockImplementation(() => ({
      call: vi.fn(async (method: string) => {
        if (method === "domain.check") {
          return { checks: [{ domain: "example.com", avail: true, price: 9.99, currency: "EUR" }] };
        }
        if (method === "domain.list") {
          return { domains: [{ domain: "example.com" }] };
        }
        return {};
      }),
      logout: vi.fn(async () => undefined),
    })),
  };
});

describe("tools", () => {
  const context = { config: { username: "u", password: "p", environment: "ote" as const } };

  it("maps domain.check response", async () => {
    const tool = createTools().find((t) => t.name === "inwx_domain_check");
    if (!tool) throw new Error("tool not found");
    const result = await tool.run({ domain: "example.com" }, context);
    expect(Array.isArray(result)).toBe(true);
  });

  it("maps domain.list response", async () => {
    const tool = createTools().find((t) => t.name === "inwx_domain_list");
    if (!tool) throw new Error("tool not found");
    const result = (await tool.run({}, context)) as { total: number };
    expect(result.total).toBe(1);
  });

  it("ensures all 23 tools are registered in factory", () => {
    expect(createTools()).toHaveLength(23);
    expect(vi.isMockFunction(InwxClient)).toBe(true);
  });
});
