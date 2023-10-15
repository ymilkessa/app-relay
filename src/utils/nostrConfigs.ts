import { Configs } from "../types/configs";
import YAML from "yaml";
const fs = require("fs");

/**
 * Reads the nostr config file and returns a Configs object.
 */
export const getNostrAppConfigs = (): Configs => {
  const configsFile = process.env.NOSTR_CONFIGS_FILE || "nostr-configs.yml";
  const configsDir = process.env.NOSTR_CONFIGS_DIR || ".nostr";
  const configsPath = `${configsDir}/${configsFile}`;

  const configsString = fs.readFileSync(configsPath, "utf8");
  const configs: Configs = YAML.parse(configsString);
  return configs;
};

/**
 * Returns true if:
 * 1. There is at least 1 allowed event kind.
 * 2. There is at least 1 app pubkey.
 */
export const areConfigsValid = (configs: Configs): boolean => {
  return configs.event.kinds.length > 0 && configs.app.appPubkeys.length > 0;
};
