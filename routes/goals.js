const express = require("express");
const router = express.Router();
const { MongoClient, ObjectId } = require("mongodb");

const mongoUri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.q6ywm.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri);
const collectionName = process.env.MONGO_COLLECTION || "charities";

async function getCollection() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Connected to MongoDB successfully");
    }
    return client.db(process.env.MONGO_DB_NAME).collection(collectionName);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
}

router.post("/saveCharity", async (req, res) => {
  const { name, description, websiteUrl, userName, userEmail } = req.body;

  console.log("Form Data Submitted:", req.body);

  if (!name || !userName || !userEmail) {
    return res.status(400).send("Missing required fields: name, userName, or userEmail.");
  }

  try {
    const collection = await getCollection();
    const result = await collection.insertOne({
      name,
      description: description || "No description available",
      websiteUrl: websiteUrl || "No website provided",
      userName,
      userEmail,
      createdAt: new Date(),
    });

    console.log("Inserted Document ID:", result.insertedId);
    res.redirect(`/goals?userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`);
  } catch (error) {
    console.error("Error saving charity:", error.message);
    res.status(500).send("Failed to save charity.");
  }
});

router.post("/deleteCharity", async (req, res) => {
  const { charityId, userEmail, userName } = req.body;

  if (!charityId || !userEmail) {
    return res.status(400).send("Missing required fields: charityId or userEmail");
  }

  try {
    const collection = await getCollection();
    const result = await collection.deleteOne({
      _id: new ObjectId(charityId),
      userEmail: userEmail
    });

    if (result.deletedCount === 0) {
      return res.status(404).send("Charity not found or unauthorized");
    }

    res.redirect(`/goals?userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`);
  } catch (error) {
    console.error("Error deleting charity:", error.message);
    res.status(500).send("Failed to delete charity.");
  }
});

router.get("/", async (req, res) => {
  const { userEmail, userName } = req.query;

  try {
    const collection = await getCollection();
    let savedCharities = [];
    
    if (userEmail) {
      savedCharities = await collection.find({ userEmail }).toArray();
      console.log(`Fetched ${savedCharities.length} charities for user: ${userEmail}`);
    }
    
    res.render("savedCharities", { 
      savedCharities,
      userEmail: userEmail || '',
      userName: userName || ''
    });
  } catch (error) {
    console.error("Error fetching saved charities:", error.message);
    res.status(500).send("Failed to fetch saved charities.");
  }
});

module.exports = router;