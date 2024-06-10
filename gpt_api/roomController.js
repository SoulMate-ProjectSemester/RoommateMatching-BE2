const roomService = require('./roomService');
const writeFile = require('./writeFile');
const messageRepository = require('./saveMessageRepository')

exports.saveRoomChat = async (req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).send('roomId are required');
    }
  
    try {
      await writeFile.saveToRoomMessageFile(roomId);
      const message = "방에 있는 사람들이 서로에 대해 선호도가 얼마나 되는지 1 - 10점으로 알려줘.";
      const response = await roomService.getRoomResponse(roomId, message);
      res.json(response);
    } catch (error) {
      console.error('Failed to process roomId message:', error);
      res.status(500).send('Failed to process roomId message');
    }
  };

  exports.findRoomMessage = async(req, res) => {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).send('roomId are required');
    }
  
    try {
      const response = await messageRepository.findRoomMessage(roomId)
      res.json(response);
    } catch (error) {
      console.error('Failed to process roomId message:', error);
      res.status(500).send('Failed to process roomId message');
    }
  }