const firebaseInstance = require("./firebaseInstance");

const createNewCelebrity = async (req, res) => {
  const { twitterLink, address } = req.body;

  if (!twitterLink || !address) {
    const errorMessage =
      (!twitterLink ? "twitterLink" : "address") + " is required.";

    return res.status(400).send(errorMessage);
  }

  const celebrities = await firebaseInstance.get("/celebrities.json").then(res => res.data);
  const celebrityExist = celebrities.find(
    (celeb) => celeb.twitterLink === twitterLink
  );

  if (celebrityExist) {
    return res.status(400).send("Celebrity Already Exists.");
  }
  await firebaseInstance.put("/celebrities.json", [
    { twitterLink, address },
    ...celebrities,
  ]);

  return res.send("New Celebrity Created");
};

module.exports = createNewCelebrity;

