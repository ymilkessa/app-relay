export type EventData = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
};

export type SingleKindEvent<N extends number = number> = {
  id: string;
  pubkey: string;
  created_at: number;
  kind: N;
  tags: string[][];
  content: string;
  sig: string;
};

export type EventWithVerification = EventData & {
  verified?: boolean;
};

export enum ClientMessageTypes {
  /**
   * ["EVENT", event JSON as defined above], used to publish events.
   */
  EVENT = "EVENT",
  /**
   * ["REQ", subscription_id, filters JSON...], used to request events and subscribe to new updates.
   */
  REQ = "REQ",
  /**
   * ["CLOSE", subscription_id], used to stop previous subscriptions.
   */
  CLOSE = "CLOSE",
}

export enum RelayResponseTypes {
  /**
   * ["EVENT", subscription_id, event JSON]
   */
  EVENT = "EVENT",
  /**
   * ["OK", event_id, true|false, message]
   */
  OK = "OK",
  /**
   * ["EOSE", subscription_id]: indicates 'end of stored events' (all stored events have been sent over to the recepient).
   */
  EOSE = "EOSE",
  /**
   * ["NOTICE", message]: For human-readable messages.
   */
  NOTICE = "NOTICE",
}

export enum EventKinds {
  METADATA = 0,
  TEXT_NOTE = 1,
  ENCRYPTED_MESSAGE = 4,
}

export interface SubscriptionFilters {
  ids?: string[];
  authors?: string[];
  kinds?: number[];
  since?: number;
  until?: number;
  limit?: number;
  ["#e"]?: string[];
  ["#p"]?: string[];
}

/**
 * ["EVENT", signed_event_data]
 */
export type EventFromClient = [ClientMessageTypes.EVENT, EventData];

/**
 * ["REQ", subscription_id, filters]
 */
export type SubscriptionRequest = [
  ClientMessageTypes.REQ,
  string,
  SubscriptionFilters
];
/**
 * ["CLOSE", subscription_id]
 */
export type CloseSubscriptionRequest = [ClientMessageTypes.CLOSE, string];

export type AnyClientMessage =
  | EventFromClient
  | SubscriptionRequest
  | CloseSubscriptionRequest;

/**
 * ["EVENT", subscription_id, signed_event_data]
 */
export type EventFromRelay = [ClientMessageTypes.EVENT, string, EventData];

/**
 * An ok message type from the relay.
 * ["OK", event_id, true|false, message]
 */
export type OkMessage = [RelayResponseTypes.OK, string, boolean, string];
