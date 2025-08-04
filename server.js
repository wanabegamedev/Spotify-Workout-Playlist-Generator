const express = require("express"); 
const dotenv = require("dotenv");   
const cors = require("cors");      
const fetch = require("node-fetch")
const {GoogleGenerativeAI} = require("@google/genai")



//Loads .env file
dotenv.config();

//creates backend server
const app = express();

const port = 3000


app.use(cors())

//Get access key and return it
app.get('/api/token', async (req, res) => {
    const spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    // This is the request we will send to Spotify
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            // We need to base64 encode our client ID and secret
            'Authorization': 'Basic ' + (Buffer.from(spotifyClientId + ':' + spotifyClientSecret).toString('base64'))
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();

    // Send the access token and our user ID back to the frontend
    res.json({
        access_token: data.access_token,
        user_id: process.env.SPOTIFY_USER_ID
    });
});


app.post('/api/get-ai-response', async (request, res) => {
    try {
        // Get the prompt from the frontend's request body
        const userPrompt = request.body.prompt;

        if (!userPrompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite"});
        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        const text = response.text();

        // Send the AI's text response back to the frontend
        res.json({ text: text });

    } catch (error) {
        console.error("Error with Google AI:", error);
        res.status(500).json({ error: "Failed to get response from AI" });
    }
});

// Start the server and allows the frontend to see it
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});