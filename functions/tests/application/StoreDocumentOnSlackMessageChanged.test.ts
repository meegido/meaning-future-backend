import { describe, it, expect, vi, beforeEach } from "vitest";
import { LinksRepository } from "../../src/domain/LinksRepository";
import { MessageRepository } from "../../src/domain/MessageRepository";
import { SummaryRepository } from "../../src/domain/SummaryRepository";
import { StoreLinkOnMessageShared } from "../../src/application/StoreDocumentOnSlackMessageChanged";
import { UsersRepository, User } from "../../src/domain/UsersRepository";
import { LinkContent } from "../../src/domain/types";

describe("StoreLinkOnMessageShared", () => {
  let linksRepository: LinksRepository;
  let messageRepository: MessageRepository;
  let summaryRepository: SummaryRepository;
  let usersRepository: UsersRepository;
  let storeLinkOnMessageShared: StoreLinkOnMessageShared;

  beforeEach(async () => {
    linksRepository = {
      saveLink: vi.fn(),
    };

    messageRepository = {
      fetchMessage: vi.fn().mockResolvedValue({
        from_url: "http://example.com",
        content: "example content",
        service_icon: "http://example.com/icon.png",
        service_name: "example service",
        title: "example title",
        timestamp: 1234567890,
        image_url: "http://example.com/image.png",
        text: "example text",
      } as LinkContent),
    };

    summaryRepository = {
      fetchSummary: vi.fn().mockResolvedValue("example summary"),
    };

    usersRepository = {
      fetchUser: vi
        .fn()
        .mockResolvedValue({ id: "AN_ID", name: "laponyo" } as User),
    };

    storeLinkOnMessageShared = new StoreLinkOnMessageShared(
      linksRepository,
      messageRepository,
      summaryRepository,
      usersRepository,
    );
  });

  it("saves link with summary when message is shared", async () => {
    await storeLinkOnMessageShared.execute("A_USER_ID");

    expect(messageRepository.fetchMessage).toHaveBeenCalled();
    expect(summaryRepository.fetchSummary).toHaveBeenCalledWith(
      "http://example.com",
    );
    expect(usersRepository.fetchUser).toHaveBeenCalledWith("A_USER_ID");
    expect(linksRepository.saveLink).toHaveBeenCalledWith({
      from_url: "http://example.com",
      content: "example content",
      service_icon: "http://example.com/icon.png",
      service_name: "example service",
      title: "example title",
      timestamp: 1234567890,
      image_url: "http://example.com/image.png",
      text: "example text",
      userName: "laponyo",
      perplexitySummary: "example summary",
    });
  });
});
