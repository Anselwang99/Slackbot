import axios from 'axios';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';
import { CONVERSATION_RESTARTED } from '../constants';
import ThreadMessageI from '../interfaces/threadMessages.interface';
import ThreadMessagesI from '../interfaces/threadMessages.interface';
import logger, { prettyJSON } from '../utils/logger';
import AiService from './ai.service';
import EnvService from './env.service';
import GoogleService from './google.service';

class CommonService {
  public async postMessage({
    sink,
    text,
    blocks,
    ts,
    metadata,
  }: {
    sink: string;
    text: string;
    blocks?: string;
    ts: string;
    metadata?: string;
  }): Promise<ThreadMessageI | undefined> {
    let body = {
      channel: sink,
      thread_ts: ts,
      text,
      metadata,
    } as any;
    if (blocks) {
      body = {
        ...body,
        blocks,
      };
    }
    try {
      const response = await axios.post(
        `https://slack.com/api/chat.postMessage`,
        body,
        {
          headers: {
            Authorization: `Bearer ${EnvService.env().BOT_USER_OAUTH_TOKEN}`,
          },
        }
      );
      if (!response || response.status != 200 || response.data.ok === false) {
        throw Error(
          `Failed to post chat, request body: ${prettyJSON(
            body
          )} response status: ${response.status} response data: ${prettyJSON(
            response.data
          )}`
        );
      }
      return response.data.message as ThreadMessageI;
    } catch (e) {
      logger.error(`Error posting message to ${sink}`);
      logger.error(prettyJSON(e));
    }
    return undefined;
  }

  public async getReplies({
    channel,
    ts,
  }: {
    channel: string;
    ts?: string;
  }): Promise<string | null> {
    try {
      const response = await axios.get(
        `https://slack.com/api/conversations.replies?channel=${channel}&limit=1&ts=${ts}`,
        {
          headers: {
            Authorization: `Bearer ${EnvService.env().BOT_USER_OAUTH_TOKEN}`,
          },
        }
      );
      if (!response || response.status != 200 || response.data.ok === false) {
        throw Error(
          `Failed to get conversation history, request body: ${prettyJSON(
            channel
          )} response status: ${response.status} response data: ${prettyJSON(
            response.data
          )}`
        );
      }
      const msg = (response.data.messages as ThreadMessagesI[])?.[0].text;
      if (!msg) {
        logger.error(`No messages found for ${channel}`);
        return null;
      }
      return msg;
    } catch (e) {
      logger.error(`Error getting conversation history for ${channel}`);
      logger.error(prettyJSON(e));
    }
    return null;
  }

  public async postMessageInDm({
    sink,
    text,
    blocks,
    metadata,
  }: {
    sink: string;
    text: string;
    blocks?: string;
    metadata?: string;
  }): Promise<ThreadMessageI | undefined> {
    let body = {
      channel: sink,
      // thread_ts: ts,
      text,
      metadata,
    } as any;
    if (blocks) {
      body = {
        ...body,
        blocks,
      };
    }
    try {
      const response = await axios.post(
        `https://slack.com/api/chat.postMessage`,
        body,
        {
          headers: {
            Authorization: `Bearer ${EnvService.env().BOT_USER_OAUTH_TOKEN}`,
          },
        }
      );
      if (!response || response.status != 200 || response.data.ok === false) {
        throw Error(
          `Failed to post chat, request body: ${prettyJSON(
            body
          )} response status: ${response.status} response data: ${prettyJSON(
            response.data
          )}`
        );
      }
      return response.data.message as ThreadMessageI;
    } catch (e) {
      logger.error(`Error posting message to ${sink}`);
      logger.error(prettyJSON(e));
    }
    return undefined;
  }

  public async preparePrompt({
    context,
    question,
  }: {
    context: string;
    question: string;
  }): Promise<ChatCompletionRequestMessage[]> {
    if (context === CONVERSATION_RESTARTED) {
      return [];
    }
    const prompt = [] as ChatCompletionRequestMessage[];
    prompt.push({
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: 'You are a customer service representative at home depot.',
    });
    prompt.push({
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `Question: ${question}`,
    });
    prompt.push({
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `Please answer strictly using the following context in JSON format: ${context}`,
    });
    return prompt;
  }

  public async postReplyInDm({
    sink,
    text,
    ts,
    thread_ts,
  }: {
    sink: string;
    text: string;
    ts: string;
    thread_ts: string | undefined;
  }): Promise<void> {
    const productId = await this.getReplies({channel: sink, ts: thread_ts ?? ts});
    if (!productId) {
      await this.postMessage({
        sink,
        text: `No product id found for ${sink}`,
        ts,
      });
      return;
    }
    const homeDepotResult = await GoogleService.getResults({text: productId});
    if (!homeDepotResult) {
      await this.postMessage({
        sink,
        text: `This product id ${productId} seems invalid.`,
        ts,
      });
      return;
    }

    delete homeDepotResult.images;

    if (!thread_ts) {
      await this.postMessage({
        sink,
        text: `We received your interest to know more about:\nProduct id *${productId}* : *${homeDepotResult.title}*\n\nPlease type in your question in this thread for the above product id.`,
        ts,
      });
      return;
    }
    const chatgptResponse = await AiService.generateReply({prompt: await this.preparePrompt({context: JSON.stringify(homeDepotResult), question: text})});

    await this.postMessage({
      sink,
      text: chatgptResponse ? chatgptResponse : 'Sorry, I did not understand your question. Please try again.',
      ts,
    });
  }
}

export default CommonService;
