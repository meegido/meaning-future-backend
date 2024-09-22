import {LinkContent} from "./types";

export interface LinksRepository {
    saveLink(linkContent: LinkContent): Promise<void>;
}