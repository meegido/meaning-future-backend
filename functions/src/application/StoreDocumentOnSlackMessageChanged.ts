import {LinksRepository} from "../domain/LinksRepository";
import {MessageRepository} from "../domain/MessageRepository";
import {SummaryRepository} from "../domain/SummaryRepository";


class StoreLinkOnMessageShared {
  constructor(
      private readonly linksRepository: LinksRepository,
      private readonly messageRepository: MessageRepository,
      private readonly summaryRepository: SummaryRepository,
  ) {}

    async execute() {
        const linkContent = await this.messageRepository.fetchMessage();
        const summary = await this.summaryRepository.fetchSummary(linkContent.from_url);
        await this.linksRepository.saveLink({...linkContent, perplexitySummary: summary});
    }

}

module.exports = StoreLinkOnMessageShared;