import AWS from "aws-sdk";
import { nanoid } from "nanoid";
import { Course, Lesson } from '../models/course';
import slugify from "slugify";
import { readFile, readFileSync } from "fs";

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  apiVersion: process.env.AWS_API_VERSION,
};

const S3 = new AWS.S3(awsConfig);

export const uplaodImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).send("No image captured");

    // prepare image
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );

    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "eduweb-bucket",
      Key: `${nanoid()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        return res.sendStatus(400);
      }
      res.send(data);
    });
  } catch (err) {}
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
        res.sendStatus(400);
      }
      res.send({ success: true });
    });
  } catch (error) {}
};

export const create = async (req, res) => {
  try {
    const alreadyExist = await Course.findOne({
      slug: slugify(req.body.title.toLowerCase()),
    });

    if (alreadyExist) return res.status(400).send("Title is taken");

    const course = await new Course({
      slug: slugify(req.body.title),
      instructor: req.user.id,
      title: req.body.title,
      price: req.body.price,
      image: req.body.image,
    }).save();

    res.json(course);
  } catch (err) {
    return res.status(400).send("Course create failed. Try again!");
  }
};

export const viewInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id })
      .sort({ createdAt: -1 })
      .exec();
    res.json(courses);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
};

export const viewCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug }).exec();
    const lessons = await Lesson.find({course}).exec();

    res.json({course, lessons});
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
};

export const uploadVideo = async (req, res) => {
  try {
    const { video } = req.files;
    // console.log(video)
    if (!video) {
      return res.status(400).send("No Video");
    }

    const params = {
      Bucket: "eduweb-bucket",
      Key: `${nanoid()}.${video.type.split("/")[1]}`, // type = video/mp4
      Body: readFileSync(video.path),
      ACL: "public-read",
      ContentType: video.type,
    };

    // upload to S3
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      }

      console.log(data);
      res.send(data);
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Something went wrong");
  }
};

export const removeVideo = async (req, res) => {
  try {
    const { video } = req.body;

    if (!video) {
      return res.status(400).send("No Video");
    }
    const params = {
      Bucket: video.Bucket,
      Key: video.Key,
    };

    // delete from S3
    S3.deleteObject(params, (err, data) => {
      if (err) {
        res.sendStatus(400);
      }
      res.send(data);
    });
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
};

export const createTopic = async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, video, image } = req.body;

    const lesson = await new Lesson({
      slug: slugify(title),
      title: title,
      image: image,
      video: video,
    }).save();

    const course = await Course.findOne({ slug: slug }).exec();

    lesson.course = course;
    lesson.save()

    course.lessons.push(lesson)
    course.save() 

    // const updated = await Course.findOneAndUpdate(
    //   { slug },
    //   {
    //     $push: { lessons: { title, video, image, slug: slugify(title) } },
    //   },
    //   { new: true }
    // ).exec();
    res.json({ sucesss: true });
  } catch (err) {
    console.log(err);
    return res.status(400).send("Add Topic Failed");
  }
};


export const editCourse = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({slug}).exec();

    if (course.instructor.toString() !== req.user.id) {
      return res.status(400).send("Unauthorized")
    }

    const { title, price, image } = req.body;
    course.title = title;
    course.price = price;
    course.image = image;

    course.save()
    res.json(course);

  } catch (err) {
    res.status(400).send("Edit failed")
  }

}

export const deleteTopic = async (req, res) => {
  try {
    const { slug, lessonId } = req.params;
    console.log(lessonId)
    const course = await Course.findOne( { slug } ).exec();
    if (req.user.id !== course.instructor.toString()) {
      return res.status(400).send("Unaothorized")
    }

    let lessons = course.lessons

    lessons = lessons.filter(lesson => lesson.toString() !== lessonId);

    course.lessons = lessons
    course.save()

    const deletedLesson = await Lesson.findByIdAndDelete(lessonId)
    
    res.json({ success: true})

  } catch (err) {
    res.status(400).send("Delete failed")
  }
}