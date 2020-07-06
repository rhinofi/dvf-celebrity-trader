const functions = require("firebase-functions");
const createInitialFirebase = require("./firebase-functions/createInitialFirebase");
const createNewCelebrity = require("./firebase-functions/createNewCelebrity");
const restartCelebritiesTweets = require("./firebase-functions/restartCelebritiesTweets");
const getCelebritiesTweets = require("./firebase-functions/getCelebritiesTweets");
const rankingChange24Hours = require("./firebase-functions/rankingChange24Hours");

exports.createInitialFirebase = functions
  .runWith({ memory: "2GB", timeoutSeconds: 540 })
  .https.onRequest(createInitialFirebase);

exports.createNewCelebrity = functions
  .runWith({ memory: "2GB", timeoutSeconds: 540 })
  .https.onRequest(createNewCelebrity);

exports.restartCelebritiesTweets = functions
  .runWith({ memory: "2GB", timeoutSeconds: 540 })
  .https.onRequest(restartCelebritiesTweets);

exports.getCelebritiesTweets = functions
  .runWith({ memory: "2GB", timeoutSeconds: 540 })
  .pubsub.schedule("every 30 minutes")
  .onRun(getCelebritiesTweets);

exports.rankingChange24Hours = functions
  .runWith({ memory: "2GB", timeoutSeconds: 540 })
  .pubsub.schedule("every 24 hours")
  .onRun(rankingChange24Hours);
