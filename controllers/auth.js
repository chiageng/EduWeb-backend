import User from "../models/user";
import { hashPassword, comparePassword } from "../utils/auth";

export const register = async (req, res) => {
  try {
    // console.log(req.body)
    const { email, password } = req.body;

    console.log(req.body)

    // validation
    if (!password || password.length < 6) {
      return res
        .status(400)
        .send("Password is required and should be min 6 characters long");
    }
    let userExist = await User.findOne({ email }).exec();
    if (userExist) return res.status(400).json({ message: "Email has been taken"});

    //hash password
    const hashedPassword = await hashPassword(password);

    //register user
    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    console.log("saved user", user);
    return res.json({ user: user });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try Again");
  }
};
