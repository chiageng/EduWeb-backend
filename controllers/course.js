import AWS from 'aws-sdk'
import { nanoid } from "nanoid"

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
      console.log(data);
      res.send(data);
    })
  } catch(err) {
    console.log(err);
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