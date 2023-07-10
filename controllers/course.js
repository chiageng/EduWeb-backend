import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import { Choice, Course, Lesson, Quiz, QuizQuestion, UserCourse } from "../models/course";
import User from "../models/user";
import slugify from "slugify";
import { readFile, readFileSync } from "fs";
import { validateHeaderName } from "http";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uplaodImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).send("No image captured");

    // prepare image
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "eduweb-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        return res.sendStatus(400);
      }
      res.send(data);
    });
  } catch (err) {}
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;
    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        res.sendStatus(400);
      }
      res.send({ success: true });
    });
  } catch (error) {}
};

export const create = async (req, res) => {
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.title.toLowerCase()),
    });

    if (alreadyExist) return res.status(400).send("Title is taken");

    const course = await new Course({
      slug: slugify(req.body.title),
      instructor: req.user.id,
      title: req.body.title,
      price: req.body.price,
      image: req.body.image,
      instructor_name: req.user.name,
    }).save();

    res.json(course);
  } catch (err) {
    return res.status(400).send("Course create failed. Try again!");
  }
};



export const viewCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const lessons = await Lesson.find({ course }).exec();

    res.json({ course, lessons });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const viewLesson = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const lessons = await Lesson.find({ course }).exec();
    const lesson = lessons.filter(lesson => lesson.slug === req.params.topicSlug)[0];

    res.json({ course, lessons, lesson });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const uploadVideo = async (req, res) => {
  try {
    const { video } = req.files;

    if (!video) {
      return res.status(400).send("No Video");
    }

    const params = {
      Bucket: "eduweb-bucket",
      Key: `${nanoid()}.${video.type.split("/")[1]}`, // type = video/mp4
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    // upload to S3
    S3.upload(params, (err, data) => {
      if (err) {
        res.sendStatus(400);
      }

      res.send(data);
    });
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const removeVideo = async (req, res) => {
  try {
    const { video } = req.body;

    if (!video) {
      return res.status(400).send("No Video");
    }
    const params = {
      Bucket: video.Bucket,
      Key: video.Key,
    };

    // delete from S3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        res.sendStatus(400);
      }
      res.send(data);
    });
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const createTopic = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, video, image } = req.body;

    const lesson = await new Lesson({
      slug: slugify(title),
      title: title,
      image: image,
      video: video,
    }).save();

    const course = await Course.findOne({ slug: slug }).exec();

    lesson.course = course;
    lesson.save();

    course.lessons.push(lesson);
    course.save();

    // const updated = await Course.findOneAndUpdate(
    //   { slug },
    //   {
    //     $push: { lessons: { title, video, image, slug: slugify(title) } },
    //   },
    //   { new: true }
    // ).exec();
    res.json({ sucesss: true });
  } catch (err) {
    return res.status(400).send("Add Topic Failed");
  }
};

export const editCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).exec();

    if (course.instructor.toString() !== req.user.id) {
      return res.status(400).send("Unauthorized");
    }

    const { title, price, image } = req.body;
    course.title = title;
    course.price = price;
    course.image = image;

    course.save();
    res.json(course);
  } catch (err) {
    res.status(400).send("Edit failed");
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const course = await Course.findOne({ slug }).exec();
    if (req.user.id !== course.instructor.toString()) {
      return res.status(400).send("Unaothorized");
    }

    let lessons = course.lessons;

    lessons = lessons.filter((lesson) => lesson.toString() !== lessonId);

    course.lessons = lessons;
    course.save();

    const deletedLesson = await Lesson.findByIdAndDelete(lessonId);

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Delete failed");
  }
};

export const viewTopic = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;

    const course = await Course.findOne({ slug }).exec();
    if (req.user.id !== course.instructor.toString()) {
      return res.status(400).send("Unaothorized");
    }

    const lesson = await Lesson.findById(lessonId).exec();

    res.json(lesson);
  } catch (err) {
    res.status(400).send("View failed");
  }
};

export const editTopic = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    const { title, video, image } = req.body;

    const course = await Course.findOne({ slug: slug }).exec();

    if (req.user.id !== course.instructor.toString()) {
      return res.status(400).send("Unaothorized");
    }

    const lesson = await Lesson.findById(lessonId);

    lesson.title = title;
    lesson.image = image;
    lesson.video = video;
    lesson.save();

    // const updated = await Course.findOneAndUpdate(
    //   { slug },
    //   {
    //     $push: { lessons: { title, video, image, slug: slugify(title) } },
    //   },
    //   { new: true }
    // ).exec();
    res.json({ sucesss: true });
  } catch (err) {
    return res.status(400).send("Add Topic Failed");
  }
};

export const publishCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).exec();

    if (req.user.id !== course.instructor.toString()) {
      return res.status(400).send("Unaothorized");
    }

    course.published = true;
    course.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Publish Fail");
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug }).exec();

    if (req.user.id !== course.instructor.toString()) {
      return res.status(400).send("Unaothorized")
    }

    course.published = false;
    course.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Unpublish Fail");
  }
};

export const courses = async (req, res) => {
  try {
    const courses = await Course.find({ published: true }).exec();
    res.json(courses)
  } catch (err) {
    res.status(400).send("Courses View Fail")
  }
}

export const viewInstructorCourses = async (req, res) => {
  try {
    let courses = await Course.find({ instructor: req.user.id })
      .sort({ createdAt: -1 })
      .exec();
    res.json(courses);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
};

export const createQuiz= async (req, res) => {
  try {
    const { slug } = req.params;
    const { title } = req.body;

    const quiz = await new Quiz({
      title: title,
      slug: slugify(title),
    }).save();

    const course = await Course.findOne({ slug: slug }).exec();

    quiz.course = course;
    quiz.save();

    course.quizzes.push(quiz);
    course.save();

    res.json({ sucesss: true });
  } catch (err) {
    return res.status(400).send("Add Quiz Failed");
  }
};

export const viewQuizzes= async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const quizzes = await Quiz.find({course}).exec();

    res.json({ course, quizzes });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};



export const viewQuiz= async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const quiz = await Quiz.findOne({course, slug: req.params.quizSlug});
    const questions = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      let currQuestion = await QuizQuestion.findById(quiz.questions[i].toString()).exec();
    
      let currChoice = await Choice.find({quizQuestion: currQuestion}).exec();

      questions.push({question: currQuestion, choice: currChoice})
    }

    res.json({ course, quiz, questions });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const createQuizQuestion= async (req, res) => {
  try {
    const { slug, quizSlug } = req.params;
    const { question, choices, explanation, answer, image } = req.body;

    const course = await Course.findOne({slug}).exec();
    const quiz = await Quiz.findOne({ course, slug: quizSlug }).exec();

    let quizQuestion = await new QuizQuestion({
      question,
      answer, 
      explanation,
      quiz,
      image,
    }).save();

    const inputChoices = [];
    for (let i = 0; i < choices.length; i++) {
      let choice =await new Choice({text: choices[i].text, value: choices[i].value, image: choices[i].image, quizQuestion}).save();
      inputChoices.push(choice);
    }
    
    quizQuestion.choices = inputChoices;
    quizQuestion.save();

    quiz.questions.push(quizQuestion);

    quiz.save();

    res.json({ sucesss: true });
  } catch (err) {
    return res.status(400).send("Add Quiz Question Failed");
  }
};

export const viewQuizQuestion= async (req, res) => {
  try {
    const question = await QuizQuestion.findById(req.params.questionId).exec();
    
    const choices = await Choice.find({quizQuestion: question}).exec();

    res.json({ question, choices});
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const editQuizQuestion = async (req, res) => {
  try {
    const quizQuestion = await QuizQuestion.findById(req.params.questionId).exec();

    const { question, choices, explanation, answer, image } = req.body;

    const currChoice = quizQuestion.choices;

    for (let i = 0; i < choices.length; i++) {
      let choice =await Choice.findById(currChoice[i].toString());
      choice.text = choices[i].text;
      choice.value= choices[i].value;
      choice.image = choices[i].image;
      choice.save()
    }

    quizQuestion.question = question;
    quizQuestion.explanation = explanation;
    quizQuestion.answer = answer;
    
    quizQuestion.image = image;

    quizQuestion.save();
    res.json({success: true});

  } catch (err) {
    res.status(400).send("Edit Quiz Question failed");
  }
};

export const deleteQuizQuestion = async (req, res) => {
  try {
    const { slug, quizSlug, questionId } = req.params;
    const course = await Course.findOne({ slug }).exec();
    
    const quiz = await Quiz.findOne({ course, quizSlug }).exec();

    let questions = quiz.questions.filter(question => question.toString() !== questionId);

    quiz.questions = questions;
    quiz.save();

    
    const deletedQuestion = await QuizQuestion.findById(questionId).exec();
    for (let i = 0; i < deletedQuestion.choices.length; i++) {
      let deletedChoice = await Choice.findByIdAndDelete(deletedQuestion.choices[i].toString()).exec();
    }

    deletedQuestion.delete();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Delete failed");
  }
};