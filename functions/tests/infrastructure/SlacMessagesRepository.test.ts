import { describe, it, beforeEach, expect, vi } from "vitest";
import { App } from "@slack/bolt";
import { SlackMessagesRepository } from "../../src/infrastructure/SlackMessagesRepository";
import { LinkContent } from "../../src/domain/types";

describe("SlackMessagesRepository", () => {
  let app: App;
  let repository: SlackMessagesRepository;

  beforeEach(() => {
    app = {
      client: {
        conversations: {
          history: vi.fn(),
        },
      },
    } as unknown as App;
    repository = new SlackMessagesRepository(app);
  });

  it("fetches the latest message successfully", async () => {
    const mockMessage = {
      attachments: [
        {
          from_url: "http://example.com",
          service_icon: "http://example.com/icon.png",
          service_name: "Example Service",
          title: "Example Title",
          text: "Example Text",
          image_url: "http://example.com/image.png",
        },
      ],
    };
    (app.client.conversations.history as vi.Mock).mockResolvedValue({
      messages: [mockMessage],
    });

    const result: LinkContent = await repository.fetchMessage();

    expect(result).toEqual({
      from_url: "http://example.com",
      service_icon: "http://example.com/icon.png",
      service_name: "Example Service",
      title: "Example Title",
      text: "Example Text",
      image_url: "http://example.com/image.png",
      timestamp: expect.any(Number),
    });
  });

  it("handles missing attachments gracefully", async () => {
    (app.client.conversations.history as vi.Mock).mockResolvedValue({
      messages: [{}],
    });

    await expect(repository.fetchMessage()).rejects.toThrow();
  });

  it("handles missing messages gracefully", async () => {
    (app.client.conversations.history as vi.Mock).mockResolvedValue({
      messages: [],
    });

    await expect(repository.fetchMessage()).rejects.toThrow();
  });
});
