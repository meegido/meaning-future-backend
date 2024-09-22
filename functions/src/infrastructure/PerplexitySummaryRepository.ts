import { SummaryRepository } from '../domain/SummaryRepository';
import OpenAI from 'openai';

export class PerplexitySummaryRepository implements SummaryRepository {
  private client: OpenAI;
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://api.perplexity.ai',
    });
  }

  async fetchSummary(url: string): Promise<string> {
    const stream = await this.client.chat.completions.create({
      model: 'llama-3.1-sonar-large-128k-online',
      messages: [{ role: 'user', content: `Give me a summary of this website: ${url}` }],
    });

    return stream.choices[0].message.content!;
  }
}
