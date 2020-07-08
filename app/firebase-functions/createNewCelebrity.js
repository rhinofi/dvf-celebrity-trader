const { writeDatabase, readDatabase } = require("./firebaseDatabase");

const createNewCelebrity = async (req, res) => {
  const { twitterLink, address } = req.body;

  if (!twitterLink || !address) {
    const errorMessage =
      (!twitterLink ? "twitterLink" : "address") + " is required.";

    return res.status(400).send(errorMessage);
  }

  const celebrities = await readDatabase("/celebrities");

  const celebrityExist = celebrities.find(
    (celeb) => celeb.twitterLink === twitterLink
  );

  if (celebrityExist) {
    return res.status(400).send("Celebrity Already Exists.");
  }
  await writeDatabase("/celebrities", [
    { twitterLink, address },
    ...celebrities,
  ]);

  return res.send("New Celebrity Created");
};

module.exports = createNewCelebrity;
