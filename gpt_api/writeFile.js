const databaseService = require('./createExcelRepository');

const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '..', 'chatMessage');

async function saveToFile(userId) {
    try {
        // 폴더 존재 여부 확인
        if (!fs.existsSync(folderPath)) {
            // 폴더가 존재하지 않으면 생성
            fs.mkdirSync(folderPath);
        }

        // 파일 경로 설정
        const filePath = path.join(folderPath, `${userId}.txt`);
        const messages = await databaseService.findChatList(userId);
        
        // 메시지를 문자열로 변환
        const dataString = messages.map(msg => {
            const chatRoomIdHex = msg.chat_room_id.toString('hex'); // Buffer to string
            return `Sender ID: ${msg.sender_id}, Timestamp: ${msg.timestamp}, Chat Room ID: ${chatRoomIdHex}, Content: ${msg.content}`;
        }).join('\n');

        // 파일에 데이터 쓰기
        fs.writeFile(filePath, dataString, (err) => {
            if (err) {
                console.error('Error writing to file:', err);
            } else {
                console.log('File written successfully');
            }
        });
    } catch (err) {
        console.error('Error in saveToFile:', err);
    }
}

module.exports = { saveToFile };
