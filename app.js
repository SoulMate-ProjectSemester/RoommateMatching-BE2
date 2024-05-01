require('dotenv').config();
const express = require('express');
const chatController = require('./gpt_api/chatController');
const app = express();
const port = process.env.PORT || 8181;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/chat', chatController.handleChat);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});