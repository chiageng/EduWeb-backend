import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
      required: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    content: {
      type: {},
      minlength: 50,
    },
    video_link: {},
    free_preview: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 320,
    required: true,
  },
  slug: {
    type: String,
    lowercase: true,
  },
  description: {
    type: {},
    minlength: 50,
  },
  price: {
    type: Number,
    default: 0,
  },
  image: {},
  category: String,
  published: {
    type: Boolean,
    default: false,
  },
  instructor: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
  lessons: [lessonSchema],
}, {timestamps: true })

export default mongoose.model("Course", courseSchema);
