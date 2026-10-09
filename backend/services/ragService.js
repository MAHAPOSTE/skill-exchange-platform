import Community from "../models/communityModel.js";
import Skill from "../models/skillModel.js";

export const retrieveContext = async (question) => {
  const stopWords = new Set([
    "what",
    "which",
    "where",
    "when",
    "who",
    "how",
    "does",
    "this",
    "that",
    "with",
    "from",
    "have",
    "tell",
    "about",
    "show",
    "give",
    "list",
    "available",
    "currently",
    "platform",
    "there",
    "their",
    "some",
    "please",
    "find",
    "skill",
    "skills",
    "community",
    "communities",
    "resource",
    "resources",
    "learning",
    "exchange",
    "are",
    "the",
    "for",
    "and",
    "can",
    "you",
    "all",
    "any",
  ]);

  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(
      (word) => word.length > 2 && !stopWords.has(word)
    );

  const searchConditions = words.flatMap((word) => [
    { name: { $regex: word, $options: "i" } },
    { description: { $regex: word, $options: "i" } },
    { "posts.title": { $regex: word, $options: "i" } },
    { "posts.content": { $regex: word, $options: "i" } },
    { "resources.title": { $regex: word, $options: "i" } },
    { "resources.content": { $regex: word, $options: "i" } },
  ]);

  let communities = [];

  if (searchConditions.length > 0) {
    communities = await Community.find({
      $or: searchConditions,
    })
      .select("name description mentor posts resources")
      .populate("mentor", "name")
      .limit(5);
  }

  if (communities.length === 0) {
    communities = await Community.find({})
      .select("name description mentor posts resources")
      .populate("mentor", "name")
      .limit(5);
  }

  const skillConditions = words.map((word) => ({
    name: { $regex: word, $options: "i" },
  }));

  let skills = [];

  if (skillConditions.length > 0) {
    skills = await Skill.find({
      $or: skillConditions,
    })
      .select("name type user")
      .populate("user", "name")
      .limit(20);
  }

  const isBroadSkillQuestion =
    /\b(skills?|what can i learn|what can i teach)\b/i.test(
      question
    ) &&
    /\b(available|all|list|show|what|which|platform)\b/i.test(
      question
    );

  if (isBroadSkillQuestion || skills.length === 0) {
    skills = await Skill.find({})
      .select("name type user")
      .populate("user", "name")
      .limit(20);
  }

  return {
    communities,
    skills,
  };
};