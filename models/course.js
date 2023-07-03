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
      uniqued: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    video: {

    },
    image: {

    },
    course: {
      type: ObjectId,
      ref: 'Course'
    }
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
    uniqued: true,
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
    required: true,
  },
  image: {

  },
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
  instructor_name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 320,
  },
  lessons: [{
    type: ObjectId,
    ref: "Lesson"
  }],
}, {timestamps: true })

const userCourseSchema = new mongoose.Schema({
  course: {
    type: ObjectId,
    ref: "Course"
  },
  progress: {
    type: Number, 
    default: 0,
  }
})

export const Course = mongoose.model("Course", courseSchema);
export const Lesson = mongoose.model("Lesson", lessonSchema);
export const UserCourse = mongoose.model("UserCourse", userCourseSchema);
