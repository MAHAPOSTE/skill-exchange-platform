import { askGemini } from "../services/aiService.js";
import { retrieveContext } from "../services/ragService.js";

export const askAI = async (req, res) => {
  try {
    console.log("AI controller reached");

    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    console.log("Question:", question);

    const context = await retrieveContext(question);

    const prompt = `
You are the AI assistant for a Skill Exchange Platform.

Answer the user's question using the platform information provided below.

Platform information:
${JSON.stringify(context)}

User question:
${question}

If the platform information does not contain enough information, clearly say that the platform does not currently have enough information.
`;

    const answer = await askGemini(prompt);

    const sources = [
  ...context.communities.map((community) => ({
    type: "community",
    name: community.name,
  })),
  ...context.skills.map((skill) => ({
    type: "skill",
    name: skill.name,
    skillType: skill.type,
  })),
];

res.status(200).json({
  question,
  answer,
  sources,
});
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      message: "Failed to get AI response",
      error: error.message,
    });
  }
};