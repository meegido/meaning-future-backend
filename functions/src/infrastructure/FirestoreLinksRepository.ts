import { LinksRepository } from '../domain/LinksRepository';
import { LinkContent } from '../domain/types';

export class FirestoreLinksRepository implements LinksRepository {
  private db: FirebaseFirestore.Firestore;
  constructor(db: FirebaseFirestore.Firestore) {
    this.db = db;
  }

  async saveLink(linkContent: LinkContent): Promise<void> {
    if (!linkContent) return;

    const document = this.db.collection('links').doc();
    await document.set({
      url: linkContent.from_url,
      serviceIcon: linkContent.service_icon,
      service: linkContent.service_name,
      title: linkContent.title,
      text: linkContent.text,
      imageUrl: linkContent.image_url,
      perplexitySummary: linkContent.perplexitySummary,
      timestamp: linkContent.timestamp,
      userName: linkContent.userName,
    });
  }
}
