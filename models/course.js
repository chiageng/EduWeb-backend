import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

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
    video: {},
    image: {},
    course: {
      type: ObjectId,
      ref: "Course",
    },
    forum: {
      type: ObjectId,
      ref: "Forum"
    }
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
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
    description: {
      type: {},
      minlength: 50,
    },
    price: {
      type: Number,
      default: 0,
      required: true,
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
    instructor_name: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 320,
    },
    lessons: [
      {
        type: ObjectId,
        ref: "Lesson",
      },
    ],
    quizzes: [
      {
        type: ObjectId,
        ref: "Quiz",
      },
    ],
  },
  { timestamps: true }
);

const userCourseSchema = new mongoose.Schema({
  course: {
    type: ObjectId,
    ref: "Course",
  },
  progress: {
    type: Number,
    default: 0,
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
  enroll: {
    type: Boolean,
    default: false,
  }
});

const choiceSchema = new mongoose.Schema({
  text: {
    type: String,
  },
  value: {
    type: String,
  },
  image: {},
  quizQuestion: {
    type: ObjectId,
    ref: "QuizQuestion",
  },
});

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    video: {},
    image: {},
    choices: [
      {
        type: ObjectId,
        ref: "Choice",
      },
    ],
    answer: {
      type: String,
    },
    explanation: {
      type: String,
    },
    quiz: {
      type: ObjectId,
      ref: "Quiz",
    },
  },
  { timestamps: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      minlength: 3,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    questions: [
      {
        type: ObjectId,
        ref: "QuizQuestion",
      },
    ],
    course: {
      type: ObjectId,
      ref: "Course",
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userQuizSchema = new mongoose.Schema({
  course: {
    type: ObjectId,
    ref: "Course",
  },
  score: {
    type: Number,
  },
  user: {
    type: ObjectId,
    ref: "User",
  },
  quiz: {
    type: ObjectId,
    ref: "Quiz",
  },
  done: {
    type: Boolean,
    default: false,
  },
  solutions: [{ type: String }],
});

const forumSchema = new mongoose.Schema({
  lesson: {
    type: ObjectId,
    ref: "Lesson",
  },
  comments: [
    {
      type: ObjectId,
      ref: "Comment",
    },
  ],
});

const commentSchema = new mongoose.Schema(
  {
    forum: {
      type: ObjectId,
      ref: "Forum",
    },
    user: {
      type: ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      required: true,
      minlength: 1,
    },
    upvote: {
      type: Number,
      default: 0,
    },
    downvote: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
export const Lesson = mongoose.model("Lesson", lessonSchema);
export const UserCourse = mongoose.model("UserCourse", userCourseSchema);
export const Quiz = mongoose.model("Quiz", quizSchema);
export const QuizQuestion = mongoose.model("QuizQuestion", quizQuestionSchema);
export const Choice = mongoose.model("Choice", choiceSchema);
export const UserQuiz = mongoose.model("UserQuiz", userQuizSchema);
export const Forum = mongoose.model("Forum", forumSchema);
export const Comment = mongoose.model("Comment", commentSchema);
