const db = require("../../database");

exports.createNewCelebrity = async (req, res) => {
  const { twitterLink, address } = req.body;
  if (!twitterLink || !address) {
    const errorMessage =
      (!twitterLink ? "twitterLink" : "address") + " is required.";

    return res.status(400).send(errorMessage);
  }

  const celebrityExist = db.get("celebrities").find({ twitterLink }).value();

  if (celebrityExist) {
    return res.status(400).send("Celebrity Already Exists.");
  }

  await db.get("celebrities").push({ twitterLink, address }).write();
  return res.send("New Celebrity Created");
};
