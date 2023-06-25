import dotenv from 'dotenv';
dotenv.config();

import App from './app';
import EventController from './controllers/event.controller';
import EnvService from './services/env.service';
import AiService from './services/ai.service';
import GoogleService from './services/google.service';

const services = [EnvService, AiService, GoogleService];
for (const service of services) {
  service.init();
}

const app = new App([
  new EventController(),
]);
app.listen();
