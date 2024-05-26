const OpenAI = require('openai');
const databaseService = require('./assistantRepository');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createAssistant() {
    // create assistant
    let assistantId = await databaseService.getAssistantId();
    if (!assistantId) {
        const assistant = await openai.beta.assistants.create({
            instructions: "너는 룸메이트 매칭 서비스의 ai챗봇이야. 사용자의 질문에 친절히 답해줘",
            name: "Roommate service chatbot",
            tools: [{ type: "file_search" }],
            model: "gpt-4-turbo",
        });
        assistantId = assistant.id;
        await databaseService.saveAssistantId(assistantId);
    }
}
  
module.exports = {createAssistant};