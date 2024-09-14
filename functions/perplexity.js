const OpenAI = require("openai");
require("dotenv").config()

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

module.exports = { askQuestion };