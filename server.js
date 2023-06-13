import express from "express";
import cors from "cors";
const morgan = require("morgan");
require("dotenv").config();

//create express app
const app = express();

// apply middleware (in between response sent will run middleware function)
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// route

app.get("/", (req, res) => {
  res.send("you hit server endpoint");
});

// port
const port = 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));
