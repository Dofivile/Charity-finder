// routes/search.js

const express = require("express");
const axios = require("axios");
const { MongoClient } = require("mongodb");
const router = express.Router();

// MongoDB Connection URI
const mongoUri = process.env.MONGO_URI;

// Validate required environment variables
if (!mongoUri) {
  console.error("MONGO_URI is not defined. Please set the environment variable.");
}

if (!process.env.CHARITY_API_KEY) {
  console.error("CHARITY_API_KEY is not defined. Please set the environment variable.");
}

router.get("/", (req, res) => {
  res.render("search", { 
    charities: [], 
    error: null, 
    userName: "", 
    userEmail: "" 
  });
});

router.post("/user-info", (req, res) => {
  const { userName, userEmail } = req.body;

  if (!userName || !userEmail) {
    return res.render("search", { 
      charities: [], 
      error: "Please provide both name and email.",
      userName: "", 
      userEmail: "" 
    });
  }

  res.render("search", { 
    charities: [], 
    error: null, 
    userName, 
    userEmail 
  });
});

router.get("/results", async (req, res) => {
  const { location, cause, userName, userEmail } = req.query;

  if (!location || !cause || !userName || !userEmail) {
    return res.render("search", { 
      charities: [], 
      error: "Please provide location, cause, name, and email.",
      userName: userName || "", 
      userEmail: userEmail || "" 
    });
  }

  try {
    const response = await axios.get(`https://partners.every.org/v0.2/search/${encodeURIComponent(cause)} ${encodeURIComponent(location)}`, {
      params: { 
        apiKey: process.env.CHARITY_API_KEY, 
        take: 10 
      },
    });

    const charities = response.data?.nonprofits.map((charity) => ({
      name: charity.name || "Unnamed Charity",
      description: charity.description || "No description available",
      websiteUrl: charity.websiteUrl || "#",
    }));

    res.render("search", { 
      charities, 
      error: null,
      userName,
      userEmail
    });
  } catch (error) {
    console.error("Error fetching charity data:", error.message);
    res.render("search", { 
      charities: [], 
      error: "Failed to retrieve charities. Please try again.",
      userName,
      userEmail
    });
  }
});

router.post("/save", async (req, res) => {
  const { name, description, websiteUrl, userName, userEmail } = req.body;

  // Validate input fields
  if (!name || !websiteUrl || !userName || !userEmail) {
    return res.status(400).render("search", {
      charities: [],
      error: "Missing required fields: name, websiteUrl, userName, or userEmail.",
      userName,
      userEmail
    });
  }

  try {
    const client = new MongoClient(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection(process.env.MONGO_COLLECTION);

    // First, save or update user information
    await collection.updateOne(
      { userEmail }, 
      { 
        $set: { 
          userName, 
          userEmail,
          lastUpdated: new Date() 
        } 
      }, 
      { upsert: true }
    );

    // Then save the charity
    const charityDocument = {
      name,
      description: description || "No description available",
      websiteUrl,
      userName,
      userEmail,
      savedAt: new Date(),
    };

    const result = await collection.insertOne(charityDocument);
    console.log("Inserted document with ID:", result.insertedId);

    await client.close();

    res.redirect(`/search/goals?userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`);
  } catch (error) {
    console.error("Error saving to MongoDB:", error.message);
    res.status(500).render("search", {
      charities: [],
      error: "Failed to save charity. Please try again.",
      userName,
      userEmail
    });
  }
});

router.post("/delete", async (req, res) => {
  const { name, userEmail } = req.body;

  if (!name || !userEmail) {
    return res.status(400).render("search", {
      charities: [],
      error: "Missing required fields: name or email.",
      userName: "",
      userEmail: ""
    });
  }

  try {
    const client = new MongoClient(mongoUri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection(process.env.MONGO_COLLECTION);

    const deleteResult = await collection.deleteOne({ name, userEmail });

    console.log("Delete result:", deleteResult.deletedCount);

    await client.close();

    res.redirect(`/search/goals?userEmail=${encodeURIComponent(userEmail)}&userName=${encodeURIComponent(userName)}`);
  } catch (error) {
    console.error("Error deleting from MongoDB:", error.message);
    res.status(500).render("search", {
      charities: [],
      error: "Failed to delete charity. Please try again.",
      userName: "",
      userEmail: ""
    });
  }
});

router.get("/goals", async (req, res) => {
  const { userEmail, userName } = req.query;

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();

    const db = client.db(process.env.MONGO_DB_NAME);
    const collection = db.collection(process.env.MONGO_COLLECTION);

    let savedCharities = [];
    if (userEmail) {
      // If userEmail is provided, fetch only that user's charities
      savedCharities = await collection.find({ userEmail }).toArray();
      console.log(`Fetched ${savedCharities.length} charities for user: ${userEmail}`);
    } else {
      // If no userEmail, fetch all charities (you might want to remove this in production)
      savedCharities = await collection.find().toArray();
      console.log("Fetched all charities:", savedCharities.length);
    }

    await client.close();

    res.render("savedCharities", { 
      savedCharities,
      userName: userName || '',
      userEmail: userEmail || ''
    });
  } catch (error) {
    console.error("Error fetching saved charities:", error.message);
    res.status(500).render("search", {
      charities: [],
      error: "Failed to load saved charities. Please try again.",
      userName: userName || "",
      userEmail: userEmail || ""
    });
  }
});

module.exports = router;