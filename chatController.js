const chatService = require('./chatService');

exports.handleChat = async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message) {
    return res.status(400).send('Message and userId are required');
  }

  try {
    const response = await chatService.getChatResponse(userId, message);
    res.json(response);
  } catch (error) {
    console.error('Failed to process chat message:', error);
    res.status(500).send('Failed to process chat message');
  }
};
