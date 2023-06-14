import express from "express";

import { uplaodImage, removeImage } from "../controllers/course";

const router = express.Router();



router.post("/course/upload-image", uplaodImage);
router.post("/course/remove-image", removeImage);


module.exports =  router;