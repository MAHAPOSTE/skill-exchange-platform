import Community from "../models/communityModel.js";
import Skill from "../models/skillModel.js";
export const retrieveContext = async (question) => {
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3);

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
      .populate("mentor", "name email")
      .limit(5);
  }

  if (communities.length === 0) {
    communities = await Community.find({})
      .select("name description mentor posts resources")
      .populate("mentor", "name email")
      .limit(5);
  }

  const skills = await Skill.find({
    name: {
      $in: words.map((word) => new RegExp(word, "i")),
    },
  })
    .select("name type user")
    .populate("user", "name email")
    .limit(10);


//   console.log(
//   "RAG RESOURCES:",
//   communities.flatMap((community) => community.resources)
// );
  return {
    communities,
    skills,
  };
};