import express from "express";


const router = express.Router();

import { register, login, logout, myprofile } from '../controllers/auth'
import { verify } from "../middlewares";





router.post('/register', register);
router.post('/login', login)
router.get('/logout', logout)
router.get('/myprofile', verify, myprofile)


module.exports =  router;