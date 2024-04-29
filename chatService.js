const OpenAI = require('openai');
const databaseService = require('./DBConnect');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// create assistant
async function createAssistant(userId) {
  let assistantId = await databaseService.getAssistantId();

  if (!assistantId) {
      const assistant = await openai.beta.assistants.create({
          instructions: "너는 룸메이트 매칭 서비스의 ai챗봇이야. 사용자의 질문에 친절히 답해줘",
          name: "Roommate service chatbot",
          model: "gpt-4-turbo",
      });
      assistantId = assistant.id;
      await databaseService.saveAssistantId(assistantId);
  }
  return assistantId;
}

// create thread
async function createThread(userId) {
  let threadId = await databaseService.getThreadId(userId);
  if(!threadId){
    const thread = await openai.beta.threads.create();
    databaseService.saveThreadId(userId, thread.id);
    threadId = thread.id;
  }
  return threadId;
}

async function waitForRunCompletion(threadId, runId) {
  const checkInterval = 1000; // 1초마다 상태 체크
  let runStatus = null;

  while (runStatus !== 'completed') {
    const run = await openai.beta.threads.runs.retrieve(threadId, runId);
    runStatus = run.status;

    if (runStatus === 'completed') {
      console.log('Run completed:', run);
      console.log(run);
      return run;
    } else if (runStatus === 'failed') {
      console.log('Run failed:', run.last_error);
      return null;
    } else {
      console.log('Run status:', runStatus);
    }

    // 상태가 complete 또는 failed가 아니면 대기
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
}

// run message
async function sendMessageAndRunThread(threadId, assistantId, message) {
  const threadMessage = await openai.beta.threads.messages.create(
    threadId,
    { role: "user", content: message }
  );

  const run = await openai.beta.threads.runs.create(
    threadId,
    { assistant_id: assistantId }
  );

  // Run이 완료될 때까지 기다리기
  const completedRun = await waitForRunCompletion(threadId, run.id);

  if (completedRun) {
    console.log(completedRun)
  }

  const resultMessage = await openai.beta.threads.messages.list(
    threadId
  );

  return resultMessage;
}

async function getChatResponse(userId, message) {
  const assistantId = await createAssistant(userId);
  const threadId = await createThread(userId);
  const Messages = await sendMessageAndRunThread(threadId, assistantId, message);
  return { userId
      , response : Messages.body.data[0].content[0].text.value
  };
}

module.exports = { getChatResponse };
