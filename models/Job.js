import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const jobSchema = new mongoose.Schema(
  {
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "remote", "internship"],
      default: "full-time"
    },
    company: {
      type: String,
      required: [true, "Please provide company name"],
      maxlength: 50
    },
    position: {
      type: String,
      required: [true, "position is required"],
      maxlength: 150
    },
    status: {
      type: String,
      enum: ["interview", "declined", "pending"],
      default: "pending"
    },
    jobLocation: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "my city",
      required: true
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user"]
    }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);
