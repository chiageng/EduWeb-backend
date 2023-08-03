import express from "express";
import cors from "cors";
const morgan = require("morgan");
require("dotenv").config();
const path = require("path")

import fs from 'fs';
const mongoose = require("mongoose");

//create express app
const app = express();

// db
let db = process.env.CLOUD_DATABASE
// if (process.env.NODE_ENV === "production") {
// 	db = process.env.CLOUD_DATABASE;
// }

mongoose
	  .connect(db, {})
	  .then(() => console.log("DB connected"))
	  .catch((err) => console.log("DB Error => ", err));


// apply middleware (in between response sent will run middleware function)
app.use(cors());
app.use(express.json({limit: "5mb"}));
app.use(morgan("dev"));

// accept origin from localhost3000
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000", "https://netlify-test--lucent-praline-9bca10.netlify.app"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// route
fs.readdirSync("./routes").map((r) =>
	  app.use("/api", require(`./routes/${r}`))
	);

const _dirname = path.dirname("")
const buildPath = path.join(_dirname, "/build");

app.use(express.static(buildPath))

app.get("/*", (req, res) => {
  res.sendFile(
		path.join(__dirname, "/build/index.html"),
		function(err) {
			if (err) {
				res.status(500).send(err);
			}
		}
	)
});

// app.get("/", (req, res) => {
// 	res.send("you hit the server point")
// })

// port
const port = 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
