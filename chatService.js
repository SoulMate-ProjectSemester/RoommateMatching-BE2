const OpenAI = require('openai');
const databaseService = require('./DBConnect');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getChatResponse(userId, message) {
    let assistantId = await databaseService.getAssistantId(userId);

    if (!assistantId) {
        // 새 Assistant 생성
        const assistant = await openai.beta.assistants.create({
            instructions:
            "너는 룸메이트 매칭 서비스의 ai챗봇이야. 사용자의 질문에 친절히 답해줘",
            name: "Math Tutor",
            model: "gpt-4-turbo",
        });
        assistantId = assistant.id;
        await databaseService.saveAssistantId(userId, assistantId);
    }

    // const response = await openai.ChatCompletion.create({
    //     assistant_id: assistantId,
    //     messages: [{
    //         role: "user",
    //         content: message
    //     }]
    // });
    const thread = await openai.beta.threads.create();
    const threadId = thread.id;

    const threadMessages = await openai.beta.threads.messages.create(
        threadId,
        { role: "user", content: message}
      );

    const run = openai.beta.threads.runs.stream(threadId, {
        assistant_id: assistantId
      })
        .on('textCreated', (text) => process.stdout.write('\nassistant > '))
        .on('textDelta', (textDelta, snapshot) => process.stdout.write(textDelta.value))
        .on('toolCallCreated', (toolCall) => process.stdout.write(`\nassistant > ${toolCall.type}\n\n`))
        .on('toolCallDelta', (toolCallDelta, snapshot) => {
          if (toolCallDelta.type === 'code_interpreter') {
            if (toolCallDelta.code_interpreter.input) {
              process.stdout.write(toolCallDelta.code_interpreter.input);
            }
            if (toolCallDelta.code_interpreter.outputs) {
              process.stdout.write("\noutput >\n");
              toolCallDelta.code_interpreter.outputs.forEach(output => {
                if (output.type === "logs") {
                  process.stdout.write(`\n${output.logs}\n`);
                }
              });
            }
          }
        });

    console.log(run);


    return { userId
        //  , response: threadMessages.data.choices[0].message.content 
    };
}

module.exports = { getChatResponse };