import express from "express";

import { uplaodImage, removeImage, create, viewInstructorCourses, viewCourse } from "../controllers/course";
import { isInstructor, verify } from "../middlewares";

const router = express.Router();


// course
router.get('/course', verify, viewInstructorCourses)
router.get('/course/:slug', verify, viewCourse)
router.post("/course/createcourse",verify, isInstructor, create)

router.post("/course/upload-image", uplaodImage);
router.post("/course/remove-image", removeImage);



module.exports =  router;