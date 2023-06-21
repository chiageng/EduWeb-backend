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
} from "../controllers/course";
import { isInstructor, verify } from "../middlewares";

const router = express.Router();

// publish/unpublished course
router.put("/course/:slug/publish", verify, publishCourse)
router.put("/course/:slug/unpublish", verify, unpublishCourse)

// course
router.get("/course", verify, viewInstructorCourses);
router.get("/course/:slug", verify, viewCourse);
router.post("/course/createcourse", verify, isInstructor, create);
router.post("/course/:slug/createtopic", verify, createTopic);
router.put("/course/:slug/editcourse", verify, editCourse);
router.put("/course/:slug/:lessonId", verify, deleteTopic);
router.get("/course/:slug/:lessonId/view", verify, viewTopic);
router.post("/course/:slug/:lessonId/edit", verify, editTopic);


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
