import express from "express";
import formidable from "express-formidable";

import {
  uplaodImage,
  removeImage,
  create,
  viewInstructorCourses,
  viewCourse,
  uploadVideo,
  removeVideo,
  createTopic,
  editCourse,
  deleteTopic,
  viewTopic,
  editTopic,
  publishCourse,
  unpublishCourse,
  courses,
  viewLesson,
  createQuiz,
  viewQuiz,
  viewQuizzes,
  createQuizQuestion,
  viewQuizQuestion,
  editQuizQuestion,
  deleteQuizQuestion,
  publishQuiz,
  unpublishQuiz,
  editQuiz,
  createComment,
  viewForum,
} from "../controllers/course";
import {
  checkEnroll,
  courseEnroll,
  viewUserCourses,
  viewUserQuiz,
  viewUserQuizzes,
  saveUserQuiz,
} from "../controllers/userCourse";
import { isInstructor, verify, isEnrolled, isOwner, isEnrolledOrOwner } from "../middlewares";

const router = express.Router();

// publish/unpublished course
router.put("/course/:slug/publish", verify, publishCourse);
router.put("/course/:slug/unpublish", verify, unpublishCourse);
router.put("/course/:slug/quiz/:quizSlug/publish", verify, publishQuiz);
router.put("/course/:slug/quiz/:quizSlug/unpublish", verify, unpublishQuiz);


// course (price page both instructor and user)
router.get("/courses", verify, courses);
router.get("/course/cart/:slug", verify, viewCourse);

// both instructor and user access
router.post("/course/:slug/createComment/:topicId", verify, isEnrolledOrOwner, createComment);

// instructor actions
router.get("/course/:slug/quizzes", verify, isInstructor, isOwner, viewQuizzes);
router.get("/instructor/courses", verify, viewInstructorCourses);
router.get("/course/:slug", verify, isOwner, viewCourse);
router.post("/course/createcourse", verify, isInstructor, create);
router.get("/course/:slug/:topicSlug", verify, isEnrolledOrOwner, viewLesson);
router.get("/course/:slug/:topicSlug/:forumId", verify, isEnrolledOrOwner, viewForum);

router.post(
  "/course/:slug/createtopic",
  verify,
  isInstructor,
  isOwner,
  createTopic
);
router.put(
  "/course/:slug/editcourse",
  verify,
  isInstructor,
  isOwner,
  editCourse
);
router.put(
  "/course/:slug/:lessonId",
  verify,
  isInstructor,
  isOwner,
  deleteTopic
);
router.get("/course/:slug/:lessonId/view", verify, isOwner, viewTopic);
router.post("/course/:slug/:lessonId/edit", verify, isOwner, editTopic);
router.post(
  "/course/:slug/quiz/create",
  verify,
  isInstructor,
  isOwner,
  createQuiz
);
router.post(
  "/course/:slug/quiz/:quizSlug/createquestion",
  verify,
  isInstructor,
  isOwner,
  createQuizQuestion
);
router.put(
  "/course/:slug/quiz/:quizSlug/edit",
  verify,
  isInstructor,
  isOwner,
  editQuiz
);
router.get(
  "/course/:slug/quiz/:quizSlug/view/:questionId",
  verify,
  isInstructor,
  isOwner,
  viewQuizQuestion
);
router.put(
  "/course/:slug/quiz/:quizSlug/edit/:questionId",
  verify,
  isInstructor,
  isOwner,
  editQuizQuestion
);
router.put(
  "/course/:slug/quiz/:quizSlug/delete/:questionId",
  verify,
  isInstructor,
  isOwner,
  deleteQuizQuestion
);
router.get(
  "/course/:slug/quiz/:quizSlug",
  verify,
  isInstructor,
  isOwner,
  viewQuiz
);

//user actions
router.get("/course/cart/:slug/check", verify, checkEnroll);
router.post("/course/cart/:slug/enroll", verify, courseEnroll);
router.get("/user/courses", verify, viewUserCourses);
router.get("/user/course/:slug", verify, isEnrolled, viewCourse);
router.get("/user/course/:slug/quizzes", verify, isEnrolled, viewUserQuizzes);
router.get(
  "/user/course/:slug/quizzes/:quizSlug",
  verify,
  isEnrolled,
  viewUserQuiz
);
router.put(
  "/user/course/:slug/quizzes/:quizSlug/:quizId",
  verify,
  isEnrolled,
  saveUserQuiz
);


// image & video routes
router.post("/course/upload-image", uplaodImage);
router.post("/course/remove-image", removeImage);
router.post(
  "/course/video-upload",
  verify,
  isInstructor,
  formidable(),
  uploadVideo
);
router.post("/course/remove-video", verify, isInstructor, removeVideo);

module.exports = router;
