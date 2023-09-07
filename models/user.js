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
    image: {

    },
    background: {

    },
    school: {
      type: String,
    },
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    postal_code: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    grade_year: {
      type: String,
    },
    gender: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    exam_title: {
      type: String,
    },
    picture: {
      type: String,
      default: "/avatar.png",
    },
    is_staff: {
      type: Boolean,
      default: false,
    },
    is_instructor: {
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
    quizzes: [
      {type: ObjectId, ref: "UserQuiz"}
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
