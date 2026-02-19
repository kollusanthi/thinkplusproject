const express = require("express");
const cors = require("cors");
const { saveAttempt } = require("./models");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/submit", (req, res) => {
  const { user, score } = req.body;

  saveAttempt(user, score);

  let level, topic, difficulty;

  if (score >= 4) {
    level = "Advanced";
    topic = "Machine Learning";
    difficulty = "Increase";
  } 
  else if (score >= 2) {
    level = "Intermediate";
    topic = "Data Structures";
    difficulty = "Maintain";
  } 
  else {
    level = "Beginner";
    topic = "Basics of Programming";
    difficulty = "Decrease";
  }

  res.json({ level, topic, difficulty });
});

app.listen(5000, () => console.log("Server running on 5000"));
