require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const app = express();

const { rankingChange24Hours } = require("./src/routes/ranking");
const { createNewCelebrity } = require("./src/routes/celebrities");
const {
  celebritiesNewTweetsFinder,
  restartCelebritiesTweets,
} = require("./src/routes/tweets");

app.use(express.json({ extended: false }));

app.post("/celebrities/new", createNewCelebrity);
app.post("/tweets/restartCelebritiesTweets", restartCelebritiesTweets);

app.listen(process.env.PORT || 5000, () => console.log("Server running"));

cron.schedule("0 */5 * * * *", async () => {
  console.log("Running celebritiesNewTweetsFinder");
  await celebritiesNewTweetsFinder();
});

cron.schedule("0 0 * * *", async () => {
  console.log("Running rankingChange24Hours");
  await rankingChange24Hours();
});
