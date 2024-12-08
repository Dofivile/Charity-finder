const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB Connection Details
const mongoDetails = {
  username: process.env.MONGO_DB_USERNAME,
  password: process.env.MONGO_DB_PASSWORD,
  dbName: process.env.MONGO_DB_NAME,
  collectionName: process.env.MONGO_COLLECTION,
};
const mongoUri = `mongodb+srv://${mongoDetails.username}:${mongoDetails.password}@cluster0.q6ywm.mongodb.net/${mongoDetails.dbName}?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(mongoUri);

// Middleware
app.use(express.urlencoded({ extended: true }));

// Views Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Routes
const searchRoutes = require("./routes/search");
const goalsRoutes = require("./routes/goals");

app.use("/goals", goalsRoutes);
app.use("/search", searchRoutes);

// Redirect root route to /search
app.get("/", (req, res) => {
  res.redirect("/search");
});

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoClient.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1);
  }
}
const donationGoalsRouter = require('./routes/donationGoals');
app.use('/donation', donationGoalsRouter);  // Now using /donation as the base path

// Start the Server
app.listen(port, async () => {
  await connectToMongoDB();
  console.log(`Server is running at http://localhost:${port}`);
});
