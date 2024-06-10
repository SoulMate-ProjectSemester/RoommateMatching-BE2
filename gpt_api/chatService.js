const OpenAI = require('openai');
const databaseService = require('./assistantRepository');
const assistantService = require('./assistantService');
const saveMessageRepository = require('./saveMessageRepository')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const fs = require('fs');
const path = require('path');

const folderPath = path.join(__dirname, '..', 'userInfo');

// create thread
async function createUserThread(userId) {
  let threadId = await databaseService.getUserThreadId(userId);
  if (!threadId) {
    const filePath = path.join(folderPath, `${userId}.txt`);
    const chatList = await openai.files.create({
        file: fs.createReadStream(filePath),
        purpose: "assistants",
    });
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `너는 사용자 id가 ${userId}인 사람의 전용 챗봇이야. 키워드는 사용자가 본인의 성향을 알려주기 위해 선택한 단어들이야. 파일에 있는 키워드와 대화내용을 통해 사용자의 성격을 파악한 후 사용자의 질문에 솔직하게 답변해줘.`,
          // Attach the new file to the message.
          attachments: [{ file_id: chatList.id, tools: [{ type: "file_search" }] }],
        },
      ],
    });

    await databaseService.saveUserThreadId(userId, thread.id);
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
async function sendUserMessageAndRunThread(threadId, assistantId, userMessage) {
  const threadMessage = await openai.beta.threads.messages.create(
    threadId,
    { role: "user", content: userMessage }
  );
  
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
  });
   
  const messages = await openai.beta.threads.messages.list(threadId, {
    run_id: run.id,
  });
   
  const message = messages.data.pop();
  if (message.content[0].type === "text") {
    const { text } = message.content[0];
    const { annotations } = text;
    const citations = [];
  
    let index = 0;
    for (let annotation of annotations) {
      text.value = text.value.replace(annotation.text, "[" + index + "]");
      const { file_citation } = annotation;
      if (file_citation) {
        const citedFile = await openai.files.retrieve(file_citation.file_id);
        citations.push("[" + index + "]" + citedFile.filename);
      }
      index++;
    }
  
    console.log(text.value);
    console.log(citations.join("\n"));
  }

  // Run이 완료될 때까지 기다리기
  await waitForRunCompletion(threadId, run.id);

  const resultMessage = await openai.beta.threads.messages.list(
    threadId
  );

  return resultMessage;
}

async function getChatResponse(userId, message) {
  const assistantId = await assistantService.createAssistant();
  const threadId = await createUserThread(userId);  
  const Messages = await sendUserMessageAndRunThread(threadId, assistantId, message);
  const response = await saveMessageRepository.saveUserMessage(userId, Messages.body.data[0].content[0].text.value)
  if(response != null){
    return { userId
      , response : Messages.body.data[0].content[0].text.value
    };
  } else {
    return "오류가 발생했습니다."
  }
}

module.exports = { getChatResponse };
