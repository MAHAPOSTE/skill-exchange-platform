import { askGemini } from "../services/aiService.js";

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

    const answer = await askGemini(question);

    console.log("Gemini response received");

    res.status(200).json({
      question,
      answer,
    });
  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      message: "Failed to get AI response",
      error: error.message,
    });
  }
};