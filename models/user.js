import mongoose from "mongoose";

const { Schema } = mongoose;

const { ObjectId } = mongoose.Schema

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 64,
    },
    picture: {
      type: String,
      default: "/avatar.png",
    },
    is_staff: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_superuser: {
      type: Boolean,
      default: false,
    },
    courses: [
      {type: ObjectId, ref: "UserCourse"}
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
