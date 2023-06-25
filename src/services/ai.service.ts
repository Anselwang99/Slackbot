import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import logger, { prettyJSON } from '../utils/logger';
import EnvService from './env.service';
import AbstractService from './service';

class AiService implements AbstractService {
  static openai: OpenAIApi;
  static init(): void {
    AiService.openai = new OpenAIApi(
      new Configuration({
        apiKey: EnvService.env().OPEN_AI_API_KEY,
      })
    );
    logger.info(`Instantiated AiService with OpenAI`);
  }

  static async generateReply({
    prompt,
  }: {
    prompt: ChatCompletionRequestMessage[];
  }): Promise<string | undefined> {
    try {
      const response = await AiService.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: prompt,
      });

      return response.data.choices[0].message?.content;
    } catch (e) {
      logger.error(e);
      return undefined;
    }
  }
}

export default AiService;
