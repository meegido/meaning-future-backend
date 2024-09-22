import { LinkContent } from './types';

export interface MessageRepository {
  fetchMessage(): Promise<LinkContent>;
}
