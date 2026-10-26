import { askGemini } from "../services/aiService.js";
import { retrieveContext } from "../services/ragService.js";

export const askAI = async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const trimmedQuestion = question.trim();
    if (!Array.isArray(history)) {
  return res.status(400).json({
    message: "History must be an array",
  });
}

const validHistory = history
  .filter(
    (message) =>
      ["user", "assistant"].includes(message.role) &&
      typeof message.content === "string" &&
      message.content.trim()
  )
  .slice(-10)
  .map(
    (message) =>
      `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`
  )
  .join("\n");

    const platformKeywords =
      /\b(our|my|available|platform|community|communities|skill exchange|mentor|mentors|members|learning resources|resources|who can teach|who teaches|joined|my skills)\b/i;

    const isPlatformQuestion =
      platformKeywords.test(trimmedQuestion);

    let context = {
      communities: [],
      skills: [],
    };

    if (isPlatformQuestion) {
      context = await retrieveContext(trimmedQuestion);
    }

    
    const plainTextInstructions = `
Response formatting rules:
- Respond in plain text only.
- Do not use Markdown formatting.
- Do not use headings or section titles.
- Do not use tables, bullet points, or numbered lists.
- Do not use asterisks, hashtags, or decorative symbols for formatting.
- Do not use Markdown code fences.
- Write in simple, clear sentences and short paragraphs.
- Answer directly and keep the response relevant to the question.
- For programming questions, explain concepts in plain sentences.
- When providing code is necessary, provide the code without Markdown fences.
`;

    const prompt = `
You are a helpful AI assistant for a Skill Exchange Platform.

${plainTextInstructions}

Conversation history:
${validHistory || "This is the beginning of the conversation."}

Instructions:
- Use previous questions and answers to understand follow-up questions.
- Resolve words like "it", "its", "they", and "those" using conversation history.
- If the user asks for advantages or examples, connect the request to the previous topic.
- Answer the latest question directly.
- Do not ask for clarification when the previous messages make the topic clear.
- For platform-related questions, use only the supplied platform data.
- Do not invent platform users, skills, communities, or resources.

Platform information:
${JSON.stringify(context)}

Current user question:
${trimmedQuestion}
`;

    const answer = await askGemini(prompt);

    if (!answer || !answer.trim()) {
      return res.status(502).json({
        message: "The AI service returned an empty response",
      });
    }

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

      ...context.communities.flatMap((community) =>
        (community.resources || []).map((resource) => ({
          type: "learning-resource",
          name: resource.title,
        }))
      ),
    ];

    return res.status(200).json({
      question: trimmedQuestion,
      answer,
      sources,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    return res.status(500).json({
      message: "Failed to get AI response",
      error: error.message,
    });
  }
};