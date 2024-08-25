const { App } = require("@slack/bolt");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  //logLevel: LogLevel.DEBUG,
});

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

const CHANNEL_ID = "C07DL65JULV";

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
    // console.log(message, "---MESSAGE IN FETCH -----");
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
    console.log(callSet, "---CALL SET -----");
  } catch (error) {
    console.error(error);
  }
};

app.event("message", async ({ event, say, client }) => {
  if (event.subtype === "message_changed") {
    const message = await fetchMessage();
    await writeDocument(message);
  }
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);

  console.log("⚡️ Bolt app is running!");
})();
