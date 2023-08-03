import {
  Choice,
  Course,
  Lesson,
  Quiz,
  UserCourse,
  UserQuiz,
  QuizQuestion,
  Review,
} from "../models/course";
import User from "../models/user";

export const checkEnroll = async (req, res) => {
  try {
    const { slug } = req.params;

    const user = await User.findById(req.user.id).exec();
    const course = await Course.findOne({ slug }).exec();

    const ids = [];
    const length = user.courses && user.courses.length;

    let checker = null;

    for (let i = 0; i < length; i++) {
      let userCourse = await UserCourse.findById(
        user.courses[i].toString()
      ).exec();
      ids.push(userCourse.course.toString());
      if (userCourse.course.toString() === course.id) {
        checker = userCourse;
        break;
      }
    }

    res.json(checker);
  } catch (error) {
    res.status(400).send("Check Enrollment Failed");
  }
};

export const checkStudentsEnrollment = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).exec();
    const userCourses = await UserCourse.find({ course }).exec();
    const output = [];

    for (let i = 0; i < userCourses.length; i++) {
      let user = await User.findById(userCourses[i].user.toString()).exec();
      output.push({ user: user, enrollment: userCourses[i] });
    }

    res.json(output);
  } catch (error) {
    res.status(400).send("Check Students Enrollment Failed");
  }
};

export const approveEnrollment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { user } = req.body;

    console.log(user);

    const course = await Course.findOne({ slug }).exec();
    const userCourse = await UserCourse.findOne({ course, user }).exec();

    userCourse.enroll = true;
    userCourse.save();

    console.log(userCourse);

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Approve Student Enrollment Failed");
  }
};

export const removeEnrollment = async (req, res) => {
  try {
    const { slug } = req.params;
    const { user } = req.body;

    console.log(user);

    const course = await Course.findOne({ slug }).exec();
    const userCourse = await UserCourse.findOne({ course, user }).exec();

    userCourse.enroll = false;
    userCourse.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Remove Student Enrollment Failed");
  }
};

export const courseEnroll = async (req, res) => {
  try {
    const { slug } = req.params;

    const user = await User.findById(req.user.id).exec();
    const course = await Course.findOne({ slug }).exec();

    // if already enroll, reject the enrollment
    const ids = [];
    const length = user.courses && user.courses.length;

    for (let i = 0; i < length; i++) {
      let userCourse = await UserCourse.findById(
        user.courses[i].toString()
      ).exec();
      ids.push(userCourse.course.toString());
    }

    if (ids.includes(course.id)) {
      return res.status(400).send("Already Enrolled");
    }

    const userCourse = await new UserCourse({
      course: course.id,
      user,
    }).save();

    user.courses.push(userCourse.id);
    user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const viewUserCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).exec();
    const courses = [];

    const length = user.courses && user.courses.length;
    for (let i = 0; i < length; i++) {
      let userCourse = await UserCourse.findById(
        user.courses[i].toString()
      ).exec();
      if (userCourse.enroll) {
        let course = await Course.findById(userCourse.course.toString());

        courses.push({ course, progress: userCourse.progress });
      }
    }

    res.json(courses);
  } catch (err) {
    res.status(400).send("View Users Courses Failed");
  }
};

export const viewUserQuizzes = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const quizzes = await Quiz.find({ course, published: true }).exec();
    const user = await User.findById(req.user.id).exec();

    const output = [];

    // Loop through every quizzes of the course, if there is no UserQuiz existed, create one, else add into output with its score
    for (let i = 0; i < quizzes.length; i++) {
      let currQuiz = await Quiz.findById(quizzes[i]).exec();
      let existed;

      for (let j = 0; j < user.quizzes.length; j++) {
        let userQuiz = await UserQuiz.findById(
          user.quizzes[j].toString()
        ).exec();
        if (userQuiz.quiz.toString() === currQuiz._id.toString()) {
          existed = userQuiz;
          break;
        }
      }

      if (!existed) {
        let userQuiz = await new UserQuiz({
          course: course._id,
          quiz: currQuiz._id,
          user: user._id,
        }).save();
        output.push({
          quiz: currQuiz,
          score: userQuiz.score,
          done: userQuiz.done,
        });
        user.quizzes.push(userQuiz._id);
        user.save();
      } else {
        output.push({
          quiz: currQuiz,
          score: existed.score,
          done: existed.done,
        });
      }
    }

    res.json({ course, quizzes: output });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const viewUserQuiz = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const quiz = await Quiz.findOne({ course, slug: req.params.quizSlug });
    const user = await User.findById(req.user.id).exec();
    const questions = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      let currQuestion = await QuizQuestion.findById(
        quiz.questions[i].toString()
      ).exec();

      let currChoice = await Choice.find({ quizQuestion: currQuestion }).exec();

      questions.push({ question: currQuestion, choice: currChoice });
    }

    let userQuiz;
    for (let i = 0; i < user.quizzes.length; i++) {
      let curr = await UserQuiz.findById(user.quizzes[i].toString()).exec();
      if (curr.quiz.toString() === quiz._id.toString()) {
        userQuiz = curr;
        break;
      }
    }

    const solutions = userQuiz.solutions;

    res.json({ course, quiz, questions, solutions, userQuiz });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const saveUserQuiz = async (req, res) => {
  try {
    const userQuiz = await UserQuiz.findById(req.params.quizId).exec();

    userQuiz.solutions = req.body.solutions;
    userQuiz.score = req.body.score;
    userQuiz.done = true;

    userQuiz.save();

    res.json({ success: true });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const createReview = async (req, res) => {
  try {
    
    const user = await User.findById(req.user.id).exec();
    
    const course = await Course.findOne({ slug: req.params.slug }).exec();

    const userCourse = await UserCourse.findOne({ user, course }).exec();

    const review = await new Review({
      user, 
      course, 
      comment: req.body.comment,
      rating: req.body.rating,
    }).save();

    userCourse.reviewed = true;
    userCourse.save();

    course.reviews.push(review);

    course.accumulate_ratings = course.accumulate_ratings + req.body.rating;
    course.ratings = course.accumulate_ratings / course.reviews.length;

    course.save();

    res.json({ success: true });
    
  } catch (err) {
    res.status(400).send("Create Review Failed");
  }
};

export const viewReviews = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();

    let output = [];

    for (let i = 0; i < course.reviews.length; i++) {
      let curr = await Review.findById(course.reviews[i].toString()).exec();
      let user = await User.findById(curr.user.toString()).exec();
      output.push({ review: curr, user });
    }

    res.json(output);
    
  } catch (err) {
    res.status(400).send("View Reviews Failed");
  }
};
