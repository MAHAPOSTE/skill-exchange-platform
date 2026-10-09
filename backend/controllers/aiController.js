import { askGemini } from "../services/aiService.js";
import { retrieveContext } from "../services/ragService.js";

export const askAI = async (req, res) => {
  try {
    const { question } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        message: "Question is required",
      });
    }

    const trimmedQuestion = question.trim();

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

    const prompt = isPlatformQuestion
      ? `
You are the AI assistant for a Skill Exchange Platform.

Answer questions about the platform using the provided platform data.

Instructions:
- For available skills, list the matching skills and their types.
- For communities, list the communities found and their descriptions.
- For mentors, use only the information present in the data.
- For learning resources, use only the resources present in the data.
- Do not invent users, skills, communities, or resources.
- If relevant information is missing, clearly explain what is unavailable.
- Do not claim that no records exist unless the provided data confirms this.

Platform information:
${JSON.stringify(context)}

User question:
${trimmedQuestion}
`
      : `
You are a helpful general-purpose AI assistant.

Answer the user's question using your general knowledge.
For programming questions, explain the concept clearly and include
a simple example when useful.

Do not say that platform information is missing when answering
general knowledge questions.

User question:
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