const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("./serviceAccountKey.json");
const { onRequest } = require("firebase-functions/v2/https");
const OpenAI = require("openai");
const Sentry = require("@sentry/node");
const dotenv = require("dotenv");
const { App, ExpressReceiver } = require("@slack/bolt");


dotenv.config();

interface LinkContent {
  from_url: string;
  service_icon: string;
  service_name: string;
  title: string;
  text: string;
  image_url: string;
  perplexitySummary: string;
  timestamp: number;
}


const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET as string,
  endpoints: "/events",
  processBeforeResponse: true,
});

const app = new App({
  receiver: expressReceiver,
  token: process.env.SLACK_BOT_TOKEN,
  processBeforeResponse: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: 8080,
});

initializeApp({
   credential: cert(serviceAccount),
 });


const CHANNEL_ID = "C07DL65JULV";
const db = getFirestore();
db.settings({ignoreUndefinedProperties: true});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.perplexity.ai"
});

async function askQuestion(url: string | undefined) {
    const stream = await client.chat.completions.create({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [{ role: "user", content: `Give me a summary of this website: ${url}` }],
    });

    return stream.choices[0].message.content!;
}

async function fetchMessage(): Promise<LinkContent> {
    const result = await app.client.conversations.history({
      token: process.env.SLACK_BOT_TOKEN,
      channel: CHANNEL_ID,
      inclusive: true,
      limit: 1,
    });

    const attachment = result.messages?.[0].attachments?.[0];
    const perplexitySummary = await askQuestion(attachment?.from_url);
    const ramon = { ...attachment, perplexitySummary: perplexitySummary, timestamp:  Date.now() };
    console.info(attachment, "---MESSAGE IN FETCH -----");
    return ramon;
}

const writeDocument = async (link: LinkContent) => {
  if (!link) return;

  const document = db.collection("links").doc();
  console.info(link, "---MESSAGE IN WRITE DOCUMENT -----");
    const callSet = await document.set({
      url: link.from_url,
      serviceIcon: link.service_icon,
      service: link.service_name,
      title: link.title,
      text: link.text,
      imageUrl: link.image_url,
      perplexitySummary: link.perplexitySummary,
      timestamp: link.timestamp,
    });
    console.log(callSet, "---CALL SET ---");
    Sentry.captureMessage("Document written to Firestore");
};

// @ts-expect-error unknown function
app.event("message", async ({event}) => {
  console.info(event, "---EVENT IN MESSAGE -----");
  if (event.subtype === "message_changed") {
    const message = await fetchMessage();

    await writeDocument(message);
  }
});

Sentry.setupExpressErrorHandler(expressReceiver.app);

exports.slack = onRequest(expressReceiver.app);
