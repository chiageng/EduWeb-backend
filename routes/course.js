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
  deleteQuiz,
  createComment,
  viewForum,
  upvoteComment,
  downvoteComment,
} from "../controllers/course";
import {
  checkEnroll,
  courseEnroll,
  viewUserCourses,
  viewUserQuiz,
  viewUserQuizzes,
  saveUserQuiz,
  checkStudentsEnrollment,
  approveEnrollment,
  removeEnrollment,
  createReview,
  viewReviews,
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
router.get("/course/:slug/checkEnroll", verify, checkEnroll);

// both instructor and user access
router.post("/course/:slug/createComment/:topicId", verify, isEnrolledOrOwner, createComment);
router.post("/course/:slug/:topicSlug/:commentId/upvote", verify, isEnrolledOrOwner, upvoteComment);
router.post("/course/:slug/:topicSlug/:commentId/downvote", verify, isEnrolledOrOwner, downvoteComment);
router.get("/course/:slug/viewReviews", verify, viewReviews);

// instructor actions
router.get("/course/:slug/quizzes", verify, isInstructor, isOwner, viewQuizzes);
router.get("/course/checkStudentsEnrollment/:slug", verify, isInstructor, isOwner, checkStudentsEnrollment);
router.post("/course/approveEnrollment/:slug", verify, isInstructor, isOwner, approveEnrollment)
router.post("/course/removeEnrollment/:slug", verify, isInstructor, isOwner, removeEnrollment)
router.get("/instructor/courses", verify, viewInstructorCourses);
router.get("/course/:slug", verify, isEnrolledOrOwner, viewCourse);
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
router.get("/course/:slug/view/:lessonId/topic", verify, isOwner, viewTopic);
router.post("/course/:slug/:lessonId/edit", verify, isOwner, editTopic);
router.get(
  "/course/:slug/quiz/:quizSlug/view",
  verify,
  isInstructor,
  isOwner,
  viewQuiz
);
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
router.put(
  "/course/:slug/quiz/:quizSlug/delete",
  verify,
  isInstructor,
  isOwner,
  deleteQuiz
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


//user actions

router.post("/course/cart/:slug/enroll", verify, courseEnroll);
router.post("/course/:slug/createReview", verify, isEnrolled, createReview);
router.get("/user/courses", verify, viewUserCourses);
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
