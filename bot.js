// import { ChatGPTAPIBrowser } from "chatgpt";

// async function example() {
//   // use puppeteer to bypass cloudflare (headful because of captchas)
//   const api = new ChatGPTAPIBrowser({
//     email: "irontmp+coa5w@gmail.com",
//     password: "c?_%M-4eJr8N!@y",
//     markdown: false,
//   });

//   await api.initSession();

//   const result = await api.sendMessage("Hello World!");
//   console.log(result.response);
// }
// example();
import { ChatGPTAPI } from "chatgpt";
import TelegramBot from "node-telegram-bot-api";

(async () => {
  const api = new ChatGPTAPI();
  let conversation = new ChatGPTConversation(api);
  await api.ensureAuth();
  const bot = new TelegramBot(
    "5569436287:AAFKFPEO5wzflNIVFY_jEfQ5afUyMHivhOw",
    { polling: true }
  );
  const { first_name: botName } = await bot.getMe();
  bot.onText(/\/chatgpt (.+)/, async (msg, match) => {
    const { id: chatId } = msg.chat;
    console.log(new Date(), `${msg.from.username}: ${match[1]}`);
    if (match[1] === "new") {
      conversation = new ChatGPTConversation(api);
      await bot.sendMessage(chatId, "Starting new conversation", {
        reply_to_message_id: msg.message_id,
      });
    } else {
      await bot.sendChatAction(chatId, "typing");
      const typingInterval = setInterval(
        async () => await bot.sendChatAction(chatId, "typing"),
        5000
      );
      let response;
      try {
        let count = 0;
        const maxTries = 5;
        while (true) {
          try {
            response = await conversation.sendMessage(match[1]);
            break;
          } catch (error) {
            console.log(new Date(), error.toString());
            if (++count === maxTries) throw error;
          }
        }
      } catch (error) {
        response = error.toString();
      }
      clearInterval(typingInterval);
      await bot.sendMessage(chatId, response, {
        reply_to_message_id: msg.message_id,
      });
    }
  });
  console.log(new Date(), `${botName} is ready ✨`);
})();
