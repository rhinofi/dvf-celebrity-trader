const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const config = process.env;

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  databaseURL: adminConfig.databaseURL,
  projectId: adminConfig.projectId,
  storageBucket: adminConfig.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
  measurementId: config.measurementId,
};


firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const authenticateUser = async () => {
  const auth = await firebase.auth();
  if (!auth.currentUser) {
    await firebase
      .auth()
      .signInWithEmailAndPassword(config.loginEmail, config.loginPassword)
      .catch(function (error) {
        console.log("Error", error.code);
        console.log("Error", error.message);
      });
  }
};

exports.readDatabase = async (table) => {
  await authenticateUser();

  return database
    .ref(table)
    .once("value")
    .then((snap) => snap.val());
};

exports.writeDatabase = async (table, data) => {
  await authenticateUser();
  return database.ref(table).set(data);
};
