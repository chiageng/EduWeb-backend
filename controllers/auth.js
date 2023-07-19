import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";
import jwt from 'jsonwebtoken'

export const register = async (req, res) => {
  try {
    // console.log(req.body)
    const { email, password, name } = req.body;

    // validation
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).send("Email has been taken");

    //hash password
    const hashedPassword = await hashPassword(password);

    //register user
    const user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    return res.json({ user: user });
  } catch (err) {
    return res.status(400).send("Error. Try Again");
  }
};


const generateAccessToken = (user) => {
  return jwt.sign({id: user.id, name: user.name, isStaff: user.is_staff, isSuperuser: user.is_superuser}, process.env.JWT_SECRET, { expiresIn: '1d'});
}

const generateRefreshToken = (user) => {
  return jwt.sign({id: user.id, isAdmin: user.isAdmin}, 'myRefreshSecretKey', { expiresIn: '1d'})
}


export const login = async (req, res) => {
  try {
    // console.log(req.body);
    const { email, password } = req.body;
    // check if our db has user with that email
    const user = await User.findOne({ email }).exec();
    if (!user) return res.status(400).send("No Such User Exist");

    const match = await comparePassword(password, user.password);

    if (!match) return res.status(400).send("Wrong password");

    // create signed jwt
    const token = generateAccessToken(user);

    // return user and token to frontend. exclude hashed password
    user.password = undefined;

    // send token in cookie 
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true // only works on https
    });

    // send user as json response 
    res.json({
      user
    });
  } catch (err) {
    // return res.status(400).send("Something wrong when login");
    return res.status(400).send(err);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({message: "Sign out success"})
  } catch (err) {
    return res.status(400).send("Something wrong when logout")
  }
}

export const editProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { name, examTitle, gradeYear, school, gender, phoneNumber, address1, address2, postalCode, state, country } = req.body;

    user.name = name;
    user.exam_title = examTitle;
    user.grade_year = gradeYear;
    user.school = school; 
    user.gender = gender;
    user.phone_number = phoneNumber;
    user.address1 = address1;
    user.address2 = address2;
    user.postal_code = postalCode;
    user.state = state;
    user.country = country;

    user.save();

    return res.json({success: true});
  } catch (err) {
    return res.status(400).send("Something wrong when edit profile");
  }
}

export const viewProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.json({user: user});
  } catch (err) {
    return res.status(400).send("Something wrong when edit profile");
  }
}

