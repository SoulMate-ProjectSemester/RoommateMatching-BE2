const chatService = require('./chatService');
const writeFile = require('./writeFile');

exports.handleChat = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).send('Message and userId are required');
  }

  try {
    await writeFile.saveToFile(userId);
    const response = await chatService.getChatResponse(userId, message);
    res.json(response);
  } catch (error) {
    console.error('Failed to process chat message:', error);
    res.status(500).send('Failed to process chat message');
  }
};
