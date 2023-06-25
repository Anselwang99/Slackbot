import { cleanEnv, str } from 'envalid';

import AbstractService from './service';
import logger from '../utils/logger';

export type EnvVariables = {
  NODE_ENV: string;
  PORT: string;
  SIGNING_SECRET: string;
  BOT_USER_OAUTH_TOKEN: string;
  OPEN_AI_API_KEY: string;
  SERPAPI_API_KEY: string;
  WEBSITE_URL: string;
  ADMIN_DASHBOARD_URL: string;
  PRIVACY_POLICY_URL: string;
  TERMS_N_CONDITIONS_URL: string;
};

/*
 * This service is responsible for loading environment variables
 */
class EnvService implements AbstractService {
  static envVariables = {
    NODE_ENV: str({
      choices: ['development', 'staging', 'test', 'production'],
    }),
    PORT: str(),
    SIGNING_SECRET: str(),
    BOT_USER_OAUTH_TOKEN: str(),
    OPEN_AI_API_KEY: str(),
    SERPAPI_API_KEY: str(),
    WEBSITE_URL: str(),
    ADMIN_DASHBOARD_URL: str(),
    PRIVACY_POLICY_URL: str(),
    TERMS_N_CONDITIONS_URL: str(),
  };

  static envs: Readonly<EnvVariables>;

  // This is an idempotent operation, you can call init as many times as you want
  static init(): void {
    this.envs = cleanEnv(process.env, EnvService.envVariables, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reporter: ({ errors }: { errors: any }) => {
        if (Object.keys(errors).length > 0) {
          logger.error(`Invalid env vars: ${Object.keys(errors)}`);
        }
      },
    });

    logger.info(`Loaded env and running in env ${process.env.NODE_ENV}`);
  }

  static env(): Readonly<EnvVariables> {
    return (
      this.envs ?? {
        NODE_ENV: 'test',
        PORT: '3001',
      }
    );
  }
}

export default EnvService;
