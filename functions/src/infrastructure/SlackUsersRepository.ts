import { User, UsersRepository } from '../domain/UsersRepository';
import { App } from '@slack/bolt';

export class SlackUsersRepository implements UsersRepository {
  constructor(private readonly app: App) {}

  async fetchUser(userId: string): Promise<User> {
    const slackUser = await this.app.client.users.info({
      token: process.env.SLACK_BOT_TOKEN,
      user: userId,
    });

    console.log({ slackUser });

    return {
      id: slackUser.user!.id!,
      name: slackUser.user!.name!,
    };
  }
}
