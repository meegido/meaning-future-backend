import { describe, it, beforeEach, expect, vi } from "vitest";
import { FirestoreLinksRepository } from "../../src/infrastructure/FirestoreLinksRepository";
import { LinkContent } from "../../src/domain/types";
import * as admin from "firebase-admin";

vi.mock("firebase-admin", () => {
  const firestore = {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    set: vi.fn().mockResolvedValue(undefined),
  };
  return {
    firestore: () => firestore,
    initializeApp: vi.fn(),
  };
});

describe("FirestoreLinksRepository", () => {
  let db: FirebaseFirestore.Firestore;
  let repository: FirestoreLinksRepository;

  beforeEach(() => {
    db = admin.firestore();
    repository = new FirestoreLinksRepository(db);
  });

  it("saves a valid link content to Firestore", async () => {
    const linkContent: LinkContent = {
      from_url: "https://example.com",
      service_icon: "icon.png",
      service_name: "Example Service",
      title: "Example Title",
      text: "Example Text",
      image_url: "https://example.com/image.png",
      perplexitySummary: "Example Summary",
      timestamp: Date.now(),
      userName: "laponyo",
    };

    const setSpy = vi.spyOn(db.collection("links").doc(), "set");

    await repository.saveLink(linkContent);

    expect(setSpy).toHaveBeenCalledWith({
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
  });

  it("does not save when link content is null", async () => {
    const setSpy = vi.spyOn(db.collection("links").doc(), "set");

    await repository.saveLink(null);

    expect(setSpy).not.toHaveBeenCalled();
  });

  it("does not save when link content is undefined", async () => {
    const setSpy = vi.spyOn(db.collection("links").doc(), "set");

    await repository.saveLink(undefined);

    expect(setSpy).not.toHaveBeenCalled();
  });
});
