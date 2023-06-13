import express from "express";
import cors from "cors";
const morgan = require("morgan");
require("dotenv").config();

import fs from 'fs';
const mongoose = require("mongoose");

//create express app
const app = express();

// db
mongoose
	  .connect(process.env.DATABASE, {})
	  .then(() => console.log("DB connected"))
	  .catch((err) => console.log("DB Error => ", err));

// apply middleware (in between response sent will run middleware function)
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// route
fs.readdirSync("./routes").map((r) =>
	  app.use("/api", require(`./routes/${r}`))
	);

app.get("/", (req, res) => {
  res.send("you hit server endpoint");
});

// port
const port = 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
