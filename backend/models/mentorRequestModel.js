import mongoose from "mongoose";

const mentorRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const MentorRequest = mongoose.model(
  "MentorRequest",
  mentorRequestSchema
);

export default MentorRequest;