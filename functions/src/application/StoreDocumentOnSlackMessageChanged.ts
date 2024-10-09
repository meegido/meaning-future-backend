import { LinksRepository } from '../domain/LinksRepository';
import { MessageRepository } from '../domain/MessageRepository';
import { SummaryRepository } from '../domain/SummaryRepository';
import { UsersRepository } from '../domain/UsersRepository';

export class StoreLinkOnMessageShared {
  constructor(
    private readonly linksRepository: LinksRepository,
    private readonly messageRepository: MessageRepository,
    private readonly summaryRepository: SummaryRepository,
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(userId: string) {
    const linkContent = await this.messageRepository.fetchMessage();
    const summary = await this.summaryRepository.fetchSummary(linkContent.from_url);
    const user = await this.usersRepository.fetchUser(userId);
    console.log({ user });
    await this.linksRepository.saveLink({
      ...linkContent,
      perplexitySummary: summary,
      userName: user.name,
    });
  }
}
