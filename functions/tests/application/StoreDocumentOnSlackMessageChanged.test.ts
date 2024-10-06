import { describe, it, expect, vi } from "vitest";
import { LinksRepository } from "../../src/domain/LinksRepository";
import { MessageRepository } from "../../src/domain/MessageRepository";
import { SummaryRepository } from "../../src/domain/SummaryRepository";
import { StoreLinkOnMessageShared } from "../../src/application/StoreDocumentOnSlackMessageChanged";

describe("StoreLinkOnMessageShared", () => {
  it("saves link with summary when message is shared", async () => {
    const linksRepository = {
      saveLink: vi.fn(),
    } as unknown as LinksRepository;
    const messageRepository = {
      fetchMessage: vi.fn().mockResolvedValue({
        from_url: "http://example.com",
        content: "example content",
      }),
    } as unknown as MessageRepository;
    const summaryRepository = {
      fetchSummary: vi.fn().mockResolvedValue("example summary"),
    } as unknown as SummaryRepository;

    const storeLinkOnMessageShared = new StoreLinkOnMessageShared(
      linksRepository,
      messageRepository,
      summaryRepository,
    );

    await storeLinkOnMessageShared.execute();

    expect(messageRepository.fetchMessage).toHaveBeenCalled();
    expect(summaryRepository.fetchSummary).toHaveBeenCalledWith(
      "http://example.com",
    );
    expect(linksRepository.saveLink).toHaveBeenCalledWith({
      from_url: "http://example.com",
      content: "example content",
      perplexitySummary: "example summary",
    });
  });

  it("NOT handles error when fetchMessage fails", async () => {
    const linksRepository = {
      saveLink: vi.fn(),
    } as unknown as LinksRepository;
    const messageRepository = {
      fetchMessage: vi.fn().mockRejectedValue(new Error("fetchMessage failed")),
    } as unknown as MessageRepository;
    const summaryRepository = {
      fetchSummary: vi.fn(),
    } as unknown as SummaryRepository;

    const storeLinkOnMessageShared = new StoreLinkOnMessageShared(
      linksRepository,
      messageRepository,
      summaryRepository,
    );

    await expect(storeLinkOnMessageShared.execute()).rejects.toThrow(
      "fetchMessage failed",
    );
    expect(messageRepository.fetchMessage).toHaveBeenCalled();
    expect(summaryRepository.fetchSummary).not.toHaveBeenCalled();
    expect(linksRepository.saveLink).not.toHaveBeenCalled();
  });

  it("NOT handles error when fetchSummary fails", async () => {
    const linksRepository = {
      saveLink: vi.fn(),
    } as unknown as LinksRepository;
    const messageRepository = {
      fetchMessage: vi.fn().mockResolvedValue({
        from_url: "http://example.com",
        content: "example content",
      }),
    } as unknown as MessageRepository;
    const summaryRepository = {
      fetchSummary: vi.fn().mockRejectedValue(new Error("fetchSummary failed")),
    } as unknown as SummaryRepository;

    const storeLinkOnMessageShared = new StoreLinkOnMessageShared(
      linksRepository,
      messageRepository,
      summaryRepository,
    );

    await expect(storeLinkOnMessageShared.execute()).rejects.toThrow(
      "fetchSummary failed",
    );
    expect(messageRepository.fetchMessage).toHaveBeenCalled();
    expect(summaryRepository.fetchSummary).toHaveBeenCalledWith(
      "http://example.com",
    );
    expect(linksRepository.saveLink).not.toHaveBeenCalled();
  });
});
