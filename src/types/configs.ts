export interface AppConfigs {
  appPubkeys: string[];
  internalPort: number;
  numberOfWorkers: number;
}

export interface NostrBotConfigs {
  privateKey: string;
}

export interface RelayConfigs {
  url: string;
}

export interface EventConfigs {
  kinds: number[];
  tags: {
    clientPubkeys: string[];
  };
}

export interface Configs {
  event: EventConfigs;
  app: AppConfigs;
  bot: NostrBotConfigs;
  relay: RelayConfigs;
}
