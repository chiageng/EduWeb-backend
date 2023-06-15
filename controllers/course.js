import AWS from 'aws-sdk'
import { nanoid } from "nanoid"
import Course from '../models/course'
import slugify from 'slugify'

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION
}

const S3 = new AWS.S3(awsConfig)

export const uplaodImage = async (req, res) => {
  try {
    const {image} = req.body;

    console.log(process.env.AWS_REGION)

    if (!image) return res.status(400).send("No image captured");

    // prepare image
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ""), "base64");

    console.log(base64Data);
    const type = image.split(';')[0].split('/')[1];

    // image params 
    const params = {
      Bucket: "eduweb-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return res.sendStatus(400);
      }
      res.send(data);
    })
  } catch(err) {
  }
  
};

export const removeImage = async (req, res) => {
  try {
    const { image } = req.body;

    const params = {
      Bucket: image.Bucket,
      Key: image.Key,
    };

    S3.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400)
      }
      res.send({success: true})
    })
  } catch (error) {
    console.log(error);
  }
}

export const create = async (req, res) => {
  try{
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.title.toLowerCase())
    })
    
    if (alreadyExist) return res.status(400).send("Title is taken");
    
    const course = await new Course({
      slug: slugify(req.body.title),
      instructor: req.user.id,
      title: req.body.title,
      price: req.body.price,
      image: req.body.image,
    }).save()

    res.json(course);
  } catch (err) {
    return res.status(400).send("Course create failed. Try again!")
  }
}

export const viewInstructorCourses = async(req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id}).sort({createdAt: -1}).exec();
    res.json(courses);
  } catch (err) {
    res.status(400).send("Something went wrong")
  }
}

export const viewCourse = async(req, res) => {
  try {
    const course = await Course.findOne({slug: req.params.slug}).exec();
    res.json(course);
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
}