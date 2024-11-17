import { StoreLinkOnMessageShared } from './application/StoreDocumentOnSlackMessageChanged';
import { FirestoreLinksRepository } from './infrastructure/FirestoreLinksRepository';
import { SlackMessagesRepository } from './infrastructure/SlackMessagesRepository';
import { PerplexitySummaryRepository } from './infrastructure/PerplexitySummaryRepository';
import { cert, initializeApp, ServiceAccount } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import dotenv from 'dotenv';
import { App, ExpressReceiver } from '@slack/bolt';
import { getFirestore } from 'firebase-admin/firestore';
import OpenAI from 'openai';
import { SlackUsersRepository } from './infrastructure/SlackUsersRepository';

dotenv.config();

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET as string,
  endpoints: '/events',
  processBeforeResponse: true,
});

const app = new App({
  receiver: expressReceiver,
  token: process.env.SLACK_BOT_TOKEN,
  processBeforeResponse: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: 8080,
});

const encodedServiceAccount = process.env.SERVICE_ACCOUNT_KEY || '';
const serviceAccount = JSON.parse(Buffer.from(encodedServiceAccount, 'base64').toString('utf-8'));
initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const openAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.perplexity.ai',
});

const processedEvents = new Set<string>();

// @ts-expect-error unknown function
app.event('message', async ({ event }: SlackEventMiddlewareArgs<'message'>) => {
  if (processedEvents.has(event.event_ts)) {
    return;
  }
  processedEvents.add(event.event_ts);

  const slackMessagesRepository = new SlackMessagesRepository(app);
  if (event.subtype === 'message_changed' && event.channel === slackMessagesRepository.CHANNEL_ID) {
    console.log({ event });
    const action = new StoreLinkOnMessageShared(
      new FirestoreLinksRepository(db),
      slackMessagesRepository,
      new PerplexitySummaryRepository(openAI),
      new SlackUsersRepository(app)
    );

    await action.execute(event.message.user);
  }
});

exports.slack = onRequest(expressReceiver.app);
