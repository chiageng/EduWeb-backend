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
  checkEnroll,
  courseEnroll,
  viewUserCourses,
  viewLesson
} from "../controllers/course";
import { isInstructor, verify, isEnrolled, isOwner } from "../middlewares";

const router = express.Router();

// publish/unpublished course
router.put("/course/:slug/publish", verify, publishCourse)
router.put("/course/:slug/unpublish", verify, unpublishCourse)

// course (price page both instructor and user)
router.get("/courses", verify, courses)
router.get("/course/cart/:slug", verify, viewCourse);

// both instructor and user access


// instructor actions
router.get("/instructor/courses", verify, viewInstructorCourses);
router.get("/course/:slug", verify, isOwner, viewCourse);
router.post("/course/createcourse", verify, isInstructor, create);
router.get("/course/:slug/:topicSlug", verify, isOwner, viewLesson);
router.post("/course/:slug/createtopic", verify, isInstructor, isOwner, createTopic);
router.put("/course/:slug/editcourse", verify, isInstructor, isOwner, editCourse);
router.put("/course/:slug/:lessonId", verify, isInstructor, isOwner, deleteTopic);
router.get("/course/:slug/:lessonId/view", verify, isOwner, viewTopic);
router.post("/course/:slug/:lessonId/edit", verify, isOwner, editTopic);

//user actions
router.get("/course/cart/:slug/check", verify, checkEnroll);
router.post("/course/cart/:slug/enroll", verify, courseEnroll);
router.get("/user/courses", verify, viewUserCourses)
router.get("/user/course/:slug", verify, isEnrolled, viewCourse);
router.get("/user/course/:slug/:topicSlug", verify, isEnrolled, viewLesson);



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
