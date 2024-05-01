const fs = require('fs').promises; // Use the promise-based version of fs
const path = require('path');
const databaseService = require('./createExcelRepository');

const folderPath = path.join(__dirname, '..', 'chatMessage');

async function saveToFile(userId) {
    try {
        // Ensure the folder exists
        try {
            await fs.access(folderPath);
        } catch (error) {
            await fs.mkdir(folderPath);
        }

        // Generate file path and fetch messages
        const filePath = path.join(folderPath, `${userId}.txt`);
        const messages = await databaseService.findChatList(userId);
        if (!messages) throw new Error("No messages found.");

        // Convert messages to string format
        const dataString = messages.map(msg => {
            const chatRoomIdHex = msg.chat_room_id.toString('hex');
            return `Sender ID: ${msg.sender_id}, Timestamp: ${msg.timestamp}, Chat Room ID: ${chatRoomIdHex}, Content: ${msg.content}`;
        }).join('\n');

        // Write data to file
        await fs.writeFile(filePath, dataString, 'utf8');
        console.log('File written successfully');
    } catch (err) {
        console.error('Error in saveToFile:', err);
        throw err; // Rethrow to handle error logging at a higher level
    }
}

module.exports = { saveToFile };
