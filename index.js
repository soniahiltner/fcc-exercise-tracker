const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const Exercise = require("./models/exercise");
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require("body-parser");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//create new user
app.post("/api/users", async (req, res) => {
  let body = req.body.username;

  let duplicateUser = await User.findOne({ username: body });
  if (duplicateUser) {
    res.send(
      `<h2>${duplicateUser.username} is already in database with id: ${duplicateUser._id}</h2>`
    );
  } else {
    let user = new User({ username: body });
    await user.save();
    const { username, _id } = user;

    res.json({ username: username, _id: _id });
  }
});

//get all users
app.get("/api/users", async (req, res) => {
  let users = await User.find().select({ id: -1, _id: 1, username: 1 });
  if (!users) {
    res.send("No users found");
  } else {
    console.log(users);
    res.send(users);
  }
});

//create exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  let userId = req.params._id;
  await User.findOne({ _id: userId })
    .then(async (user) => {
      let body = req.body;
      let exercise = new Exercise({
        author_id: userId,
        description: body.description,
        duration: body.duration,
        date: body.date ? new Date(body.date) : new Date(),
      });
    
      //save the exercise
      await exercise.save();

      const lastExercise = {
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString(),
        _id: user._id,
      };
      res.send(lastExercise);
    })

    .catch((err) => console.log(err));
});

//Get logs
app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  const dateFrom = new Date(from);
  const dateTo = new Date(to);
  const limitLogs = limit ? limit : 10;

  await User.findOne({ _id: userId })
    .populate("log", "description duration date")
    .then(async (user) => {
      const logs = user.log;
      const newlogs = logs.map((log) => {
        return {
          description: log.description,
          duration: log.duration,
          date: log.date
            ? new Date(log.date).toDateString()
            : new Date().toDateString(),
        };
      });

      function getfilterLogs(logs) {
        if (from && to) {
          return logs.filter(log => dateFrom <= new Date(log.date) && new Date(log.date) <= dateTo);
        }
        if (from) {
          return logs.filter(log => new Date(log.date) >= dateFrom);
        }
        if (to) {
          return logs.filter(log => new Date(log.date) <= dateTo);
        }
        return logs;
      };

      const logsByDate = getfilterLogs(newlogs);
      const limitLogsByDate = logsByDate.slice(0, limitLogs);

      const userLogs = {
        username: user.username,
        count: limitLogsByDate.length,
        _id: user.id,
        log: limitLogsByDate,
      };
      res.json(userLogs);
    })

    .catch((err) => console.log(err));
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
