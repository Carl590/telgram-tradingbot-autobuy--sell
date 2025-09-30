// Immediate trade helpers (top-level)
const TRADE_PREFIX_REGEX = /^(buy|sell)\b/i;
const BIRDEYE_REGEX =
  /birdeye\.so\/solana\/token\/([1-9A-HJ-NP-Za-km-z]{32,44})/i;
const BASE58_REGEX = /([1-9A-HJ-NP-Za-km-z]{32,44})/;

const extractMintFromMessage = (text: string): string | null => {
  const birdeyeMatch = BIRDEYE_REGEX.exec(text);
  if (birdeyeMatch) {
    return birdeyeMatch[1];
  }
  const base58Match = BASE58_REGEX.exec(text);
  if (base58Match) {
    return base58Match[1];
  }
  return null;
};

const parseImmediateTradeMessage = (
  text: string
): ImmediateTradeCommand | null => {
  if (!text) return null;
  const trimmed = text.trim();
  const prefixMatch = TRADE_PREFIX_REGEX.exec(trimmed);
  if (!prefixMatch) return null;
  const action = prefixMatch[1].toLowerCase() as ImmediateTradeCommand["action"];
  let remainder = trimmed.slice(prefixMatch[0].length).trim();
  let amount: number | undefined;
  const amountMatch = remainder.match(/^([0-9]+(?:\.[0-9]+)?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    remainder = remainder.slice(amountMatch[0].length).trim();
  }
  const mint = extractMintFromMessage(remainder);
  if (!mint) {
    return null;
  }
  return {
    action,
    mint,
    amount,
  };
};
import TelegramBot from "node-telegram-bot-api";
import { isValidWalletAddress } from "../utils";
import { contractInfoScreenHandler } from "../screens/contract.info.screen";
import {
  AUTO_BUY_TEXT,
  BUY_XSOL_TEXT,
  PRESET_BUY_TEXT,
  SELL_XPRO_TEXT,
  SET_GAS_FEE,
  SET_JITO_FEE,
  SET_SLIPPAGE_TEXT,
  WITHDRAW_TOKEN_AMT_TEXT,
  WITHDRAW_XTOKEN_TEXT,
} from "../bot.opts";
import {
  buyHandler,
  sellHandler,
  setSlippageHandler,
  executeImmediateTrade,
  type ImmediateTradeCommand,
} from "../screens/trade.screen";
import {
  withdrawAddressHandler,
  withdrawHandler,
} from "../screens/transfer.funds";
import {
  presetBuyBtnHandler,
  setCustomAutoBuyAmountHandler,
  setCustomBuyPresetHandler,
  setCustomFeeHandler,
  setCustomJitoFeeHandler,
} from "../screens/settings.screen";

export const messageHandler = async (
  bot: TelegramBot,
  msg: TelegramBot.Message
) => {
  try {
    const messageText = msg.text;
    const { reply_to_message } = msg;



    if (!messageText) return;



    if (!reply_to_message) {
      const immediateCommand = parseImmediateTradeMessage(messageText);
      if (immediateCommand) {
        await executeImmediateTrade(bot, msg, immediateCommand);
        return;
      }
    }

  const action = prefixMatch[1].toLowerCase() as ImmediateTradeCommand["action"];
  let remainder = trimmed.slice(prefixMatch[0].length).trim();

  let amount: number | undefined;
  const amountMatch = remainder.match(/^([0-9]+(?:\.[0-9]+)?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1]);
    remainder = remainder.slice(amountMatch[0].length).trim();
  }

  const mint = extractMintFromMessage(remainder);
  if (!mint) {
    return null;
  }

  return {
    action,
    mint,
    amount,
  };
};

    // ...existing code...
    if (reply_to_message && reply_to_message.text) {
      const { text } = reply_to_message;
      // if number, input amount
      const regex = /^[0-9]+(\.[0-9]+)?$/;
      const isNumber = regex.test(messageText) === true;
      const reply_message_id = reply_to_message.message_id;

      if (isNumber) {
        const amount = Number(messageText);

        if (text === BUY_XSOL_TEXT.replace(/<[^>]*>/g, "")) {
          await buyHandler(bot, msg, amount, reply_message_id);
        } else if (text === SELL_XPRO_TEXT.replace(/<[^>]*>/g, "")) {
          await sellHandler(bot, msg, amount, reply_message_id);
        } else if (text === WITHDRAW_XTOKEN_TEXT.replace(/<[^>]*>/g, "")) {
          await withdrawHandler(bot, msg, messageText, reply_message_id);
        } else if (text === SET_SLIPPAGE_TEXT.replace(/<[^>]*>/g, "")) {
          await setSlippageHandler(bot, msg, amount, reply_message_id);
        } else if (text === PRESET_BUY_TEXT.replace(/<[^>]*>/g, "")) {
          await setCustomBuyPresetHandler(bot, msg, amount, reply_message_id);
        } else if (text === AUTO_BUY_TEXT.replace(/<[^>]*>/g, "")) {
          await setCustomAutoBuyAmountHandler(
            bot,
            msg,
            amount,
            reply_message_id
          );
        } else if (text === SET_GAS_FEE.replace(/<[^>]*>/g, "")) {
          await setCustomFeeHandler(bot, msg, amount, reply_message_id);
        } else if (text === SET_JITO_FEE.replace(/<[^>]*>/g, "")) {
          if (amount > 0.0001) {
            await setCustomJitoFeeHandler(bot, msg, amount, reply_message_id);
          } else {
            await setCustomJitoFeeHandler(bot, msg, 0.0001, reply_message_id);
          }
        }
      } else {
        if (text === WITHDRAW_TOKEN_AMT_TEXT.replace(/<[^>]*>/g, "")) {
          await withdrawAddressHandler(bot, msg, messageText, reply_message_id);
        }
      }
      return;
    }

    // ...existing code...
    if (isValidWalletAddress(messageText)) {
      await contractInfoScreenHandler(bot, msg, messageText);
      return;
    }
  } catch (e) {
    console.log("~messageHandler~", e);
  }
};
