import { SummaryRepository } from '../domain/SummaryRepository';
import OpenAI from 'openai';

export class PerplexitySummaryRepository implements SummaryRepository {
  private client: OpenAI;
  constructor(apiClient: OpenAI) {
    this.client = apiClient;
  }

  async fetchSummary(url: string): Promise<string> {
    const completions = await this.client.chat.completions.create({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [{ role: 'user', content: `Give me a summary of this website: ${url}` }],
    });

    return completions.choices[0].message.content!;
  }
}
