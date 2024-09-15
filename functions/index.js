const {App, ExpressReceiver} = require("@slack/bolt");
const {getFirestore} = require("firebase-admin/firestore");
const {initializeApp, cert} = require("firebase-admin/app");
const serviceAccount = require("./serviceAccountKey.json");
const { onRequest } = require("firebase-functions/v2/https");
const OpenAI = require("openai");
const Sentry = require("@sentry/node");
const {nodeProfilingIntegration} = require("@sentry/profiling-node");
require("dotenv").config()

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});



const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
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


Sentry.setupExpressErrorHandler(expressReceiver.app);


initializeApp({
   credential: cert(serviceAccount),
 });


app.error(console.error);

const CHANNEL_ID = "C07DL65JULV";
const db = getFirestore();
db.settings({ignoreUndefinedProperties: true});

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.perplexity.ai"
});

async function askQuestion(url) {
    const stream = await client.chat.completions.create({
        model: "llama-3.1-sonar-large-128k-online",
        messages: [{ role: "user", content: `Give me a summary of this website: ${url}` }],
    });

    return stream.choices[0].message.content;
}

async function fetchMessage() {
  try {
    const result = await app.client.conversations.history({
      token: process.env.SLACK_BOT_TOKEN,
      channel: CHANNEL_ID,
      inclusive: true,
      limit: 1,
    });

    const message = result.messages[0].attachments[0];
    const perplexitySummary = await askQuestion(message.from_url);
    const ramon = { ...message, perplexitySummary: perplexitySummary, timestamp:  Date.now() };
    console.info(message, "---MESSAGE IN FETCH -----");
    return ramon;
  } catch (error) {
    console.error(error);
  }
}

const writeDocument = async (message) => {
  if (!message) return;

  const document = db.collection("links").doc();
  console.info(message, "---MESSAGE IN WRITE DOCUMENT -----");
  try {
    const callSet = await document.set({
      url: message.from_url,
      serviceIcon: message.service_icon,
      service: message.service_name,
      title: message.title,
      text: message.text,
      imageUrl: message.image_url,
      perplexitySummary: message.perplexitySummary,
      timestamp: message.timestamp,
    });
    console.log(callSet, "---CALL SET ---");
    throw new Error("My first Sentry error!");
  } catch (error) {
    console.error(error);
  }
};

app.event("message", async ({event}) => {
  console.info(event, "---EVENT IN MESSAGE -----");
  if (event.subtype === "message_changed") {
    const message = await fetchMessage();
    await writeDocument(message);
  }
});

exports.slack = onRequest(expressReceiver.app);
