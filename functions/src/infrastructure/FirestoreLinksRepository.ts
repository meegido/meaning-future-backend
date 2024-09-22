import {LinksRepository} from "../domain/LinksRepository";
import {getFirestore} from "firebase-admin/lib/firestore";
import {LinkContent} from "../domain/types";

class FirestoreLinksRepository implements LinksRepository {
    private db: FirebaseFirestore.Firestore;

    constructor() {
        this.db = getFirestore();
        this.db.settings({ ignoreUndefinedProperties: true });
    }

    async saveLink(linkContent: LinkContent): Promise<void> {
        if (!linkContent) return;

  const document = this.db.collection("links").doc();
      await document.set({
        url: linkContent.from_url,
        serviceIcon: linkContent.service_icon,
        service: linkContent.service_name,
        title: linkContent.title,
        text: linkContent.text,
        imageUrl: linkContent.image_url,
        perplexitySummary: linkContent.perplexitySummary,
        timestamp: linkContent.timestamp,
      });
    }
}

module.exports = FirestoreLinksRepository;