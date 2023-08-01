import User from "../models/user"
import { Course, UserCourse } from "../models/course";
import jwt from 'jsonwebtoken'

export const isInstructor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).exec();

    if (!user.is_staff) {
      return res.sendStatus(403);
    } else {
      next();
    }
  } catch(err) {
    console.log(err);
  }
}

export const verify = (req, res, next) => {
  // const authHeader = req.headers.authorization;
  const authHeader = req.headers.cookie
  
  if (authHeader) {
    const token = authHeader.split("token=")[1];

    // console.log(token)

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(401).json("Token is not valid / expired");
      } 

      req.user = payload;
      next();
    })
  } else {
    res.status(401).json("You are not authenticated");
  }
}

export const isOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).exec();
    const course = await Course.findOne({ slug: req.params.slug}).exec();

    if (course.instructor != req.user.id) {
      res.sendStatus(403);
    } else {
      next();
    }

  } catch (err) {
    res.status(400).json("You are not authenticated to access")
  }
}

export const isEnrolled = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).exec();
    const course = await Course.findOne({ slug: req.params.slug}).exec();

    // check if course id is found in user course array 
    let ids = [];
    const len = user.courses && user.courses.length

    for (let i = 0; i < len; i ++) {
      let userCourse = await UserCourse.findById(user.courses[i].toString()).exec()
      ids.push(userCourse.course.toString());
    }

    if (!ids.includes(course.id.toString())) {
      res.sendStatus(403);
    } else {
      next();
    }

  } catch (err) {
    res.status(400).json("You are not authenticated to access")
  }
}

export const isEnrolledOrOwner = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).exec();
    const course = await Course.findOne({ slug: req.params.slug}).exec();

    // check if course id is found in user course array 
    let ids = [];
    const len = user.courses && user.courses.length

    for (let i = 0; i < len; i ++) {
      let userCourse = await UserCourse.findById(user.courses[i].toString()).exec()
      ids.push(userCourse.course.toString());
    }

    if (!ids.includes(course.id.toString()) && course.instructor != req.user.id) {
      res.sendStatus(403);
    } else {
      next();
    }

  } catch (err) {
    res.status(400).json("You are not authenticated to access")
  }
}