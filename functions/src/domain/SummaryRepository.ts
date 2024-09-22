export interface SummaryRepository {
  fetchSummary(url: string): Promise<string>;
}
