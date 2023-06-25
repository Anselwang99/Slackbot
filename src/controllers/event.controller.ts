import axios from 'axios';
import express from 'express';
import { SLASH_COMMAND } from '../constants';

import Controller from '../interfaces/controller.interface';
import EventPayloadI, {
  MessageEventPayloadI,
} from '../interfaces/eventPayload.interface';
import CommonService from '../services/common.service';
import EnvService from '../services/env.service';

class EventController implements Controller {
  public router = express.Router();
  public commonService = new CommonService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`/event`, this.processEvent);
  }

  private processEvent = async (
    request: express.Request,
    response: express.Response
  ) => {
    if (request.body.type === 'url_verification') {
      console.log('receiving challenge');
      console.log(request.body.challenge);
      response.send(request.body.challenge);
      return;
    }
    response.send();
    const payload = request.body as EventPayloadI;
    const { type } = payload.event;
    if (type === 'message') {
      const messageEventPayload = payload as MessageEventPayloadI;

      // Do not respond to bot messages.
      if (
        messageEventPayload.event.bot_id &&
        !messageEventPayload.event.text.startsWith(SLASH_COMMAND)
      ) {
        return;
      }
      const ts = messageEventPayload.event.ts;
      const thread_ts = messageEventPayload.event.thread_ts;

      // Respond to DM to app.
      if (messageEventPayload.event.channel_type === 'im') {
        await this.commonService.postReplyInDm({
          sink: messageEventPayload.event.channel,
          text: messageEventPayload.event.text,
          ts,
          thread_ts,
        });
        return;
      }
    }
  };
}

export default EventController;
