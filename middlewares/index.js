import User from "../models/user"
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
    const token = authHeader.split("=")[1];

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