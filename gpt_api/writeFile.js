const fs = require('fs').promises; // Use the promise-based version of fs
const path = require('path');
const databaseService = require('./createFileRepository');

const userFolderPath = path.join(__dirname, '..', 'userInfo');
const roomFolderPath = path.join(__dirname, '..', 'roomMessages');

async function saveToUserMessageFile(userId) {
    try {
        // Ensure the folder exists
        try {
            await fs.access(userFolderPath);
        } catch (error) {
            await fs.mkdir(userFolderPath);
        }

        // Generate file path and fetch messages
        const filePath = path.join(userFolderPath, `${userId}.txt`);
        const keyword = await databaseService.findKeywordList(userId);
        const chatListMessages = await databaseService.findChatList(userId);
        if (!chatListMessages) throw new Error("No chatListMessages found.");
        if (!keyword) throw new Error("No keywords found.");

        // Convert keyword data to string format
        const keywordString = keyword.map(kw => `Keyword ID: ${kw.keyword_id}, Keyword Set: '${kw.value}'`).join('\n');

        // Convert chat messages to string format
        const chatString = chatListMessages.map(msg => {
            const chatRoomIdHex = Buffer.isBuffer(msg.chat_room_id) ? msg.chat_room_id.toString('hex') : 'Invalid';
            return `Sender ID: ${msg.sender_id}, Timestamp: ${msg.timestamp.toISOString()}, Chat Room ID: ${chatRoomIdHex}, Content: ${msg.content}`;
        }).join('\n');

        // Combine both strings with a separator
        const dataString = `Keywords:\n${keywordString}\n\nChat Messages:\n${chatString}`;

        // Write data to file
        await fs.writeFile(filePath, dataString, 'utf8');
        console.log('File written successfully');
    } catch (err) {
        console.error('Error in saveToFile:', err);
        throw err; // Rethrow to handle error logging at a higher level
    }
}

async function saveToRoomMessageFile(roomId) {
    try {
        // Ensure the folder exists
        try {
            await fs.access(roomFolderPath);
        } catch (error) {
            await fs.mkdir(roomFolderPath);
        }

        // Generate file path and fetch messages
        const filePath = path.join(roomFolderPath, `${roomId}.txt`);
        const roomMessage = await databaseService.findRoomMessages(roomId);
        if(!roomMessage) throw new Error("No Room Message found.");

        // Convert chat messages to string format
        const chatString = roomMessage.map(msg => {
            const chatRoomIdHex = Buffer.isBuffer(msg.chat_room_id) ? msg.chat_room_id.toString('hex') : 'Invalid';
            return `Sender ID: ${msg.sender_id}, Timestamp: ${msg.timestamp.toISOString()}, Content: ${msg.content}`;
        }).join('\n');

        // Combine both strings with a separator
        const dataString = `Room Messages:\n${chatString}`;

        // Write data to file
        await fs.writeFile(filePath, dataString, 'utf8');
        console.log('File written successfully');
    } catch (err) {
        console.error('Error in saveToFile:', err);
        throw err; // Rethrow to handle error logging at a higher level
    }
}

module.exports = { saveToUserMessageFile, saveToRoomMessageFile };
