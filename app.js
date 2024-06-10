require('dotenv').config();
const express = require('express');
const chatController = require('./gpt_api/chatController');
const roomController = require('./gpt_api/roomController');
const app = express();
const port = process.env.PORT || 8181;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/chat/new', chatController.saveUserChat);
app.post('/chat', chatController.findUserMessage);
app.post('/room/new', roomController.saveRoomChat);
app.post('/room', roomController.findRoomMessage);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});