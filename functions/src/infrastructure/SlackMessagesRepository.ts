import {MessageRepository} from "../domain/MessageRepository";
import {LinkContent} from "../domain/types";
import {App} from "@slack/bolt";

const CHANNEL_ID = "C07DL65JULV";

class SlackMessagesRepository implements MessageRepository {
    constructor(private readonly app: App) {
    }
    async fetchMessage(): Promise<LinkContent> {
    const result = await this.app.client.conversations.history({
    token: process.env.SLACK_BOT_TOKEN,
    channel: CHANNEL_ID,
    inclusive: true,
    limit: 1,
  });

  const attachment = result.messages?.[0].attachments?.[0];
  return {
    from_url: attachment!.from_url!,
    service_icon: attachment!.service_icon!,
    service_name: attachment!.service_name!,
    title: attachment!.title!,
    text: attachment!.text!,
    image_url: attachment!.image_url!,
    timestamp: Date.now(),
  };
    }
}

module.exports = SlackMessagesRepository;