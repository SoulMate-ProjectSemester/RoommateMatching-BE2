require('dotenv').config();
const express = require('express');
const chatController = require('./gpt_api/chatController');
const roomController = require('./gpt_api/roomController');
const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/chat', chatController.handleChat);
app.post('/room', roomController.handleRoom);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});