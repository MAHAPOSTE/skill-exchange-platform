import Groq from "groq-sdk";

console.log(
  "AI key loaded:",
  process.env.AI_API_KEY ? "YES" : "NO"
);

const groq = new Groq({
  apiKey: process.env.AI_API_KEY,
});

export const askGemini = async (question) => {
  console.log("Calling Groq...");

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  console.log("Groq replied");

  return response.choices[0].message.content;
};