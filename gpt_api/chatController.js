const chatService = require('./chatService');
const writeFile = require('./writeFile');
const messageRepository = require('./saveMessageRepository')

exports.saveUserChat = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).send('Message and userId are required');
  }

  try {
    await writeFile.saveToUserMessageFile(userId);
    const response = await chatService.getChatResponse(userId, message);
    res.json(response);
  } catch (error) {
    console.error('Failed to process chat message:', error);
    res.status(500).send('Failed to process chat message');
  }
};

exports.findUserMessage = async (req, res) => {
  const { userId } = req.body;
    if (!userId) {
      return res.status(400).send('userId are required');
    }
  
    try {
      const response = await messageRepository.findUserMessage(userId)
      res.json(response);
    } catch (error) {
      console.error('Failed to process userId message:', error);
      res.status(500).send('Failed to process userId message');
    }
};