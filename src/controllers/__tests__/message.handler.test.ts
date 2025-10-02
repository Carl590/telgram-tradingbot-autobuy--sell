import assert from "assert";
import TelegramBot from "node-telegram-bot-api";
import { parseImmediateTradeMessage } from "../message.handler";

const baseMessage: Pick<TelegramBot.Message, "message_id" | "date" | "chat"> = {
  message_id: 1,
  date: 0,
  chat: {
    id: 123,
    type: "private",
  },
};

(() => {
  const mint = "So11111111111111111111111111111111111111112";
  const msg = {
    ...baseMessage,
    text: `buy 0.5 https://birdeye.so/solana/token/${mint}`,
  } as TelegramBot.Message;

  const result = parseImmediateTradeMessage(msg);

  assert.ok(result, "expected plain text command to be parsed");
  assert.strictEqual(result?.action, "buy");
  assert.strictEqual(result?.amount, 0.5);
  assert.strictEqual(result?.mint, mint);
})();

(() => {
  const mint = "9wFFmW8RjWBuhG4rJAcwVJ47gCJf9bUmNXp1Vk5dXcGe";
  const text = "buy 0.5 Birdeye";
  const msg = {
    ...baseMessage,
    text,
    entities: [
      {
        type: "text_link",
        offset: text.indexOf("Birdeye"),
        length: "Birdeye".length,
        url: `https://birdeye.so/solana/token/${mint}`,
      },
    ],
  } as TelegramBot.Message;

  const result = parseImmediateTradeMessage(msg);

  assert.ok(result, "expected hyperlink command to be parsed");
  assert.strictEqual(result?.action, "buy");
  assert.strictEqual(result?.amount, 0.5);
  assert.strictEqual(result?.mint, mint);
})();

console.log("message.handler tests passed");
