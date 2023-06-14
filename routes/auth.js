import express from "express";
import jwt from 'jsonwebtoken'

const router = express.Router();

import { register, login, logout, myprofile } from '../controllers/auth'

export const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        return res.status(403).json("Token is not valid / expired");
      } 

      req.user = payload;
      next();
    })
  } else {
    res.status(401).json("You are not authenticated");
  }
}



router.post('/register', register);
router.post('/login', login)
router.get('/logout', logout)
router.get('/myprofile', verify, myprofile)


module.exports =  router;