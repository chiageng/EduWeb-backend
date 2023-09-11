import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import { Choice, Course, Forum, Lesson, Quiz, QuizQuestion, UserCourse, Comment } from "../models/course";
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

export const deleteImage = (image) => {
  const params = {
    Bucket: image.Bucket,
    Key: image.Key,
  };

  S3.deleteObject(params, (err, data) => {
    if (err) {
      // console.log(err);
    }
    // console.log("Delete Image")
  });
}

export const uploadVideo = async (req, res) => {
  try {
    const { video } = req.files;

    if (!video) {
      return res.status(400).send("No Video");
    }

    const params = {
      Bucket: "eduweb-videos",
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
    return res.status(400).send("Upload Video went wrong");
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
    return res.status(400).send("Remove video went wrong");
  }
};

export const create = async (req, res) => {
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.title.toLowerCase()),
    });

    if (alreadyExist) return res.status(400).send("Course with this title already exist");

    const course = await new Course({
      slug: slugify(req.body.title),
      instructor: req.user.id,
      title: req.body.title,
      description: req.body.description,
      level: req.body.level,
      category: req.body.category,
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
    res.status(400).send("View Lesson Went Wrong");
  }
};

export const viewForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId).exec();
    const comments = [];

    for (let i = 0; i < forum.comments.length; i++) {
      let comment = await Comment.findById(forum.comments[i].toString()).exec();
      let user = await User.findById(comment.user.toString()).exec();
      let upvote = comment.upvoteRecord.includes(req.user.id);
      let downvote = comment.downvoteRecord.includes(req.user.id)

      comments.push({comment: comment, user: user, upvote, downvote});
    }

    res.json(comments);
  } catch (error) {
    res.status(400).send("View Forum went wrong");
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
    
    course.lessons.push(lesson);

    const forum = await new Forum({
      lesson,
    }).save();

    lesson.forum = forum;


    lesson.save();
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

    const { title, category, description, level, image } = req.body;
    course.title = title;
    course.category = category;
    course.description = description;
    course.level = level;
    course.image = image;
    course.slug = slugify(title);

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
    res.status(400).send("View Topic failed");
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
    lesson.slug = slugify(title);
    lesson.save();

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
    let coursesData = await Course.find({ instructor: req.user.id }).exec();
    let courses = [];

    for (let i = 0; i < coursesData.length; i++) {
      let course = coursesData[i];
      courses.push( { course, progress: 0 });
    }
    res.json( courses );
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

export const editQuiz= async (req, res) => {
  try {
    const { slug, quizSlug } = req.params;
    const { title } = req.body;

    const course = await Course.findOne({ slug: req.params.slug }).exec();

    const quiz = await Quiz.findOne({
      course,
      slug: quizSlug
    }).exec();


    quiz.title = title;
    quiz.slug = slugify(title);

    quiz.save();
    
    res.json({ sucesss: true });
  } catch (err) {
    return res.status(400).send("Edit Quiz Failed");
  }
};



export const viewQuizzes= async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    let quizzes = await Quiz.find({course}).exec();

    quizzes = quizzes.map(quiz => { return {quiz, done: false, score: 0}})

    res.json({ course, quizzes });
  } catch (error) {
    res.status(400).send("View Quizzes went wrong");
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
    res.status(400).send("View Quiz went wrong");
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

export const deleteQuiz= async (req, res) => {
  try {
    const { slug, quizSlug } = req.params;
    const { title } = req.body;

    const course = await Course.findOne({ slug: req.params.slug }).exec();

    const quiz = await Quiz.findOne({
      course,
      slug: quizSlug
    }).exec();

    if (quiz.published) {
      return res.status(400).send("Published Quiz not able to delete")
    }

    course.quizzes = course.quizzes.filter(item => item.toString() !== quiz._id.toString())
    course.save();

    for (let i = 0; i < quiz.questions.length; i++) {
      let deletedQuestion = await QuizQuestion.findById(quiz.questions[i]._id.toString()).exec();
      
      for (let j = 0; j < deletedQuestion.choices.length; j++) {
        let deletedChoice = await Choice.findById(deletedQuestion.choices[j].toString()).exec();
        if (deletedChoice.image) {
          deleteImage(deletedChoice.image);
        }
        deletedChoice.delete();
      }

      if (deletedQuestion.image) {
        deleteImage(deletedQuestion.image);
      }

      deletedQuestion.delete();
    }

    quiz.delete();
    
    res.json({ sucesss: true });
  } catch (err) {
    return res.status(400).send("Delete Quiz Failed");
  }
};

export const deleteQuizQuestion = async (req, res) => {
  try {
    const { slug, quizSlug, questionId } = req.params;
    const course = await Course.findOne({ slug }).exec();
    
    const quiz = await Quiz.findOne({ course, slug: quizSlug }).exec();

    let questions = quiz.questions.filter(question => question.toString() !== questionId);

    quiz.questions = questions;
    quiz.save();

    
    const deletedQuestion = await QuizQuestion.findById(questionId).exec();
    for (let i = 0; i < deletedQuestion.choices.length; i++) {
      let deletedChoice = await Choice.findById(deletedQuestion.choices[i].toString()).exec();
      if (deletedChoice.image) {
        deleteImage(deletedChoice.image);
      }
      deletedChoice.delete();
    }

    if (deletedQuestion.image) {
      deleteImage(deletedQuestion.image);
    }

    deletedQuestion.delete();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Delete Quiz Question failed");
  }
};

export const publishQuiz = async (req, res) => {
  try {
    const { slug, quizSlug } = req.params;

    const course = await Course.findOne({ slug }).exec();
    const quiz = await Quiz.findOne({course, slug: quizSlug})

    quiz.published = true;
    quiz.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Publish Fail");
  }
};

export const unpublishQuiz = async (req, res) => {
  try {
    const { slug, quizSlug } = req.params;

    const course = await Course.findOne({ slug }).exec();
    const quiz = await Quiz.findOne({course, slug: quizSlug})

    quiz.published = false;
    quiz.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send("Unpublish Fail");
  }
};

export const createComment = async (req, res) => {
  try {
    const { slug, topicId } = req.params;
    const { comment } = req.body;

    const lesson = await Lesson.findById(topicId).exec();
    
    const forum = await Forum.findById(lesson.forum.toString()).exec();
    
    const newComment = await new Comment({
      comment: comment,
      forum,
      user: req.user.id
    }).save();
    
    forum.comments.push(newComment);
    forum.save();

    res.json({ success: true });
  } catch (err) {
    res.status(400).send(err)
  }
}

export const upvoteComment = async (req, res) => {
  try {
    const { slug, topicSlug, commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment.upvoteRecord.includes(req.user.id)) {
      comment.upvote = comment.upvote + 1;
      comment.upvoteRecord.push(req.user.id);
      comment.save();
    } else {
      comment.upvote = comment.upvote - 1;
      comment.upvoteRecord = comment.upvoteRecord.filter(id => id.toString() !== req.user.id.toString());
      comment.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
}

export const downvoteComment = async (req, res) => {
  try {
    const { slug, topicSlug, commentId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment.downvoteRecord.includes(req.user.id)) {
      comment.downvote = comment.downvote + 1;
      comment.downvoteRecord.push(req.user.id);
      comment.save();
    } else {
      comment.downvote = comment.downvote - 1;
      comment.downvoteRecord = comment.downvoteRecord.filter(id => id.toString() !== req.user.id.toString());
      comment.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).send(err);
  }
}