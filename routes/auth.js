import express from "express";


const router = express.Router();

import { register, login, logout, editProfile, viewProfile, adminLogin } from '../controllers/auth'
import { verify, isAdmin } from "../middlewares";




router.post('/register', register);
router.post('/login', login)
router.post('/admin/login', adminLogin)
router.get('/logout', logout)
router.put('/myprofile/edit', verify, editProfile)
router.get('/myprofile', verify, viewProfile)


module.exports =  router;