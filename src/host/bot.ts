import { NostrBotApp } from "nostr-bot-app";
import { NostrBotConfigs } from "../types/configs";

export class BotSingleton extends NostrBotApp {
  private static instance: BotSingleton;

  private constructor(configs: NostrBotConfigs) {
    super({
      privateKey: configs.privateKey,
      relays: [""],
    });
  }

  public static getNostrBot(configs: NostrBotConfigs): NostrBotApp {
    if (!this.instance) {
      this.instance = new BotSingleton(configs);
    }
    return this.instance;
  }
}
