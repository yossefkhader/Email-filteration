const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const OpenAI = require("openai");
const messages = require('../messages');
// require('dotenv').config();
// // const dotenv = require('dotenv');
// // dotenv.config(path.join(__dirname,'..','.env'));

console.log('Loaded API Key:', process.env.OPENAI_API_KEY);


app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const jsonFilePath = path.join(__dirname, '../public/data/rules.json');

// API to fetch rules from rules.json
app.get('/api/rules', (req, res) => {
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading rules file, try to submit a rule.' });
        }

        // Handle the case when the file is empty or invalid
        if (!data || data.trim() === '') {
            return res.json([]);  // Return an empty array if the file is empty
        }

        try {
            const rules = JSON.parse(data);  // Try to parse the file content

            // If parsing succeeds, return the rules (make sure it's an array)
            if (!Array.isArray(rules)) {
                return res.json([]);  // If it's not an array, return an empty array
            }

            res.json(rules);  // Return the parsed array of rules
        } catch (parseError) {
            // If JSON parsing fails, return an empty array instead of an error
            return res.json([]);  // Return an empty array on parsing error
        }
    });
});


// API to interact with AI
app.post('/api/ai', async (req, res) => {

    const userInput = req.body.input;

    try {
        // Example AI API interaction (replace with your actual AI API call)
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,  // Use the environment variable
          });
        
        // Using await to handle the async request
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                //{ "role": "system", "content": messages.aiPrompt },
                { "role": "user", "content": messages.aiPrompt + "\n\n" + userInput }
            ]
        });

        // Let's assume completion.choices[0].message.content contains the AI response
        let aiResponse = completion.choices[0].message.content.trim();

        //Detect and remove code block formatting
        if (aiResponse.startsWith('```json') && aiResponse.endsWith('```')) {
            // Strip the code block delimiters
            aiResponse = aiResponse.slice(7, -3).trim();  // Remove ```json and ```
        }

        try {
            // Parse the AI response to JSON
            const jsonAiResponse = JSON.parse(aiResponse);
            return res.json({ response: jsonAiResponse });  // Send valid AI response
        } catch (parseError) {
            // Step 3: Handle non-JSON responses (Error or plain text)
            if (aiResponse.startsWith('Error:')) {
                return res.status(400).json({ error: aiResponse });
            } else {
                return res.status(500).json({ error: 'AI response could not be parsed to JSON.' });
            }
        }
    } catch (error) {
        console.error('Error communicating with OpenAI API:', error);
        // Differentiate between known errors and unknown issues
        if (error.response) {
            return res.status(error.response.status).json({ error: error.response.data });
        }
        res.status(500).json({ error: 'Failed to get AI response. Please try again later.' });
    }
});

// API to save the approved AI-generated rules
app.post('/api/save-rule', (req, res) => {
    const newRules = req.body.rules;  // The approved AI-generated rules (should be an array)

    // Read the existing rules.json file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            // If the file does not exist, start with an empty array
            if (err.code === 'ENOENT') {
                data = '[]';  // Assume empty array if file is missing
            } else {
                return res.status(500).json({ error: 'Error reading rules file' });
            }
        }

        let existingRules;
        try {
            // Check if the file is empty, if so, treat it as an empty array
            if (!data || data.trim() === '') {
                existingRules = [];  // Treat empty file as empty array
            } else {
                existingRules = JSON.parse(data);  // Parse existing rules
            }
            // Check if the new rules are an array and append them to the existing rules
            if (Array.isArray(newRules)) {
                const updatedRules = [...existingRules, ...newRules];  // Merge the arrays

                // Write the updated rules back to the rules.json file
                fs.writeFile(jsonFilePath, JSON.stringify(updatedRules, null, 2), 'utf8', (err) => {
                    if (err) return res.status(500).json({ error: 'Error saving rules' });
                    res.json({ message: 'Rules saved successfully' });
                });
            } else {
                res.status(400).json({ error: 'Invalid format: expected an array of rules' });
            }
        } catch (parseError) {
            return res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

app.post('/api/delete-rule', (req, res) => {
    const updatedRules = req.body.rules;  // The updated array of rules

    // Write the updated rules back to the rules.json file
    fs.writeFile(jsonFilePath, JSON.stringify(updatedRules, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Error saving updated rules' });
        }
        res.json({ message: 'Rules updated successfully' });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
