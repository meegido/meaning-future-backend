const {App, ExpressReceiver} = require("@slack/bolt");
const {getFirestore} = require("firebase-admin/firestore");
const {initializeApp, cert} = require("firebase-admin/app");
const serviceAccount = require("./serviceAccountKey.json");
const { onRequest } = require("firebase-functions/v2/https");
require("dotenv").config()

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


initializeApp({
   credential: cert(serviceAccount),
 });

 
// Global error handler
app.error(console.log);

const CHANNEL_ID = "C07DL65JULV";
const db = getFirestore();
db.settings({ignoreUndefinedProperties: true});

async function fetchMessage() {
  try {
    const result = await app.client.conversations.history({
      token: process.env.SLACK_BOT_TOKEN,
      channel: CHANNEL_ID,
      inclusive: true,
      limit: 1,
    });

    // There should only be one result (stored in the zeroth index)
    const message = result.messages[0].attachments[0];
    console.log(message, "---MESSAGE IN FETCH -----");
    return message;
  } catch (error) {
    console.error(error);
  }
}

const writeDocument = async (message) => {
  if (!message) return;

  const document = db.collection("links").doc();

  try {
    const callSet = await document.set({
      url: message.from_url,
      serviceIcon: message.service_icon,
      service: message.service_name,
      title: message.title,
      text: message.text,
      imageUrl: message.image_url,
    });
    console.log(callSet, "---CALL SET ---");
  } catch (error) {
    console.error(error);
  }
};

app.event("message", async ({event}) => {
  if (event.subtype === "message_changed") {
    const message = await fetchMessage();
    await writeDocument(message);
  }
});

exports.slack = onRequest(expressReceiver.app);
