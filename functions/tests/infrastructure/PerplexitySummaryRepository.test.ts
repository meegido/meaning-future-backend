import { describe, it, expect, vi } from "vitest";
import OpenAI from "openai";
import { PerplexitySummaryRepository } from "../../src/infrastructure/PerplexitySummaryRepository";

describe("PerplexitySummaryRepository", () => {
  it("fetches summary successfully", async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "Summary of the website" } }],
          }),
        },
      },
    };

    const repository = new PerplexitySummaryRepository(
      mockClient as unknown as OpenAI,
    );
    const summary = await repository.fetchSummary("http://example.com");

    expect(summary).toBe("Summary of the website");
  });

  it("handles empty summary response", async () => {
    const mockClient = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "" } }],
          }),
        },
      },
    };

    const repository = new PerplexitySummaryRepository(
      mockClient as unknown as OpenAI,
    );
    const summary = await repository.fetchSummary("http://example.com");

    expect(summary).toBe("");
  });
});
