import { EventData } from "./nostrData";

export interface ConnectionManagerInterface {
  send: (message: string) => void;
  getIdentifier: () => string;
}

export type HostBlackBox = (
  input: EventData
) => Promise<EventData> | EventData | void;
