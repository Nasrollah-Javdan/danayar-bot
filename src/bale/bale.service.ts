import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

export interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

export interface InlineKeyboard {
  inline_keyboard: InlineKeyboardButton[][];
}

export interface ReplyKeyboardButton {
  text: string;
}

export interface ReplyKeyboard {
  keyboard: ReplyKeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

@Injectable()
export class BaleService implements OnModuleInit {
  private token = process.env.BALE_TOKEN;
  private api = process.env.BALE_API;
  private offset = 0;

  async onModuleInit() {
    console.log('🤖 Bale Bot Started');
    this.polling();
  }

  async polling() {
    while (true) {
      try {
        const res = await axios.get(`${this.api}/bot${this.token}/getUpdates`, {
          params: {
            offset: this.offset,
            timeout: 30,
          },
        });

        const updates = res.data.result || [];

        for (const update of updates) {
          this.offset = update.update_id + 1;
          await this.handleUpdate(update);
        }
      } catch (error) {
        console.log('Polling error:', error.message);
      }
    }
  }

  private updateHandlers: Array<(update: any) => Promise<void>> = [];

  onUpdate(handler: (update: any) => Promise<void>) {
    this.updateHandlers.push(handler);
  }

  async handleUpdate(update: any) {
    for (const handler of this.updateHandlers) {
      await handler(update);
    }
  }

  async sendMessage(
    chatId: number | string,
    text: string,
    replyMarkup?: InlineKeyboard | ReplyKeyboard,
  ) {
    const payload: any = {
      chat_id: chatId,
      text,
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    await axios.post(`${this.api}/bot${this.token}/sendMessage`, payload);
  }

  async answerCallbackQuery(callbackQueryId: string, text?: string) {
    const payload: any = {
      callback_query_id: callbackQueryId,
    };

    if (text) {
      payload.text = text;
    }

    await axios.post(
      `${this.api}/bot${this.token}/answerCallbackQuery`,
      payload,
    );
  }

  async editMessageText(
    chatId: number | string,
    messageId: number,
    text: string,
    replyMarkup?: InlineKeyboard,
  ) {
    const payload: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
    };

    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    await axios.post(`${this.api}/bot${this.token}/editMessageText`, payload);
  }

  async deleteMessage(chatId: number | string, messageId: number) {
    await axios.post(`${this.api}/bot${this.token}/deleteMessage`, {
      chat_id: chatId,
      message_id: messageId,
    });
  }

  async removeReplyKeyboard(chatId: number | string) {
    await axios.post(`${this.api}/bot${this.token}/sendMessage`, {
      chat_id: chatId,
      text: ' ',
      reply_markup: { remove_keyboard: true },
    });
  }
}
