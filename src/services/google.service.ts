import { getJson } from "serpapi";
import AbstractService from "./service";
import EnvService from "./env.service";
import logger from "../utils/logger";

class GoogleService implements AbstractService {
  static init(): void {
  }

  static async getResults({text}: {text: string}): Promise<any | undefined> {
    try {
      const json = await getJson( 'home_depot_product', { api_key: EnvService.env().SERPAPI_API_KEY, product_id: text });
      return json.product_results;
    } catch (e) {
      logger.error(e);
      return undefined;
    }
  }
}

export default GoogleService;