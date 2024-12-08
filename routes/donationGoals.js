// donationGoals.js
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGO_URI;

// Set a yearly goal for a charity
router.post('/set', async (req, res) => {
    const { charityId, yearlyGoal, userEmail } = req.body;
    
    try {
        const client = new MongoClient(mongoUri);
        await client.connect();
        
        const collection = client.db(process.env.MONGO_DB_NAME)
                                .collection(process.env.MONGO_COLLECTION);

        await collection.updateOne(
            { _id: new ObjectId(charityId), userEmail },
            { $set: { yearlyGoal: Number(yearlyGoal) } }
        );

        await client.close();
        res.redirect('/search/goals');
    } catch (error) {
        console.error('Error setting goal:', error);
        res.status(500).send('Error setting goal');
    }
});

// Log a donation
router.post('/donate', async (req, res) => {
    const { charityId, amount, userEmail } = req.body;
    
    try {
        const client = new MongoClient(mongoUri);
        await client.connect();
        
        const collection = client.db(process.env.MONGO_DB_NAME)
                                .collection(process.env.MONGO_COLLECTION);

        // Add to total donated amount
        await collection.updateOne(
            { _id: new ObjectId(charityId), userEmail },
            { 
                $inc: { totalDonated: Number(amount) },
                $push: { 
                    donations: { 
                        amount: Number(amount), 
                        date: new Date() 
                    } 
                }
            }
        );

        await client.close();
        res.redirect('/search/goals');
    } catch (error) {
        console.error('Error logging donation:', error);
        res.status(500).send('Error logging donation');
    }
});

module.exports = router;