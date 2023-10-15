import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";
import { EventData, EventWithVerification } from "../types/nostrData";
import { bytesToHex } from "@noble/hashes/utils";

const utf8Encoder = new TextEncoder();

const isRecord = (obj: unknown): obj is Record<string, unknown> =>
  obj instanceof Object;

export function isEventSchemaValid<T>(event: T): event is T & EventData {
  if (!isRecord(event)) return false;
  if (typeof event.id !== "string") return false;
  if (typeof event.kind !== "number") return false;
  if (typeof event.content !== "string") return false;
  if (typeof event.created_at !== "number") return false;
  if (typeof event.pubkey !== "string") return false;
  if (typeof event.sig !== "string") return false;
  if (!event.pubkey.match(/^[a-f0-9]{64}$/)) return false;

  if (!Array.isArray(event.tags)) return false;
  for (let i = 0; i < event.tags.length; i++) {
    let tag = event.tags[i];
    if (!Array.isArray(tag)) return false;
    for (let j = 0; j < tag.length; j++) {
      if (typeof tag[j] === "object") return false;
    }
  }

  return true;
}

export function serializeEvent(evt: EventData): string {
  if (!isEventSchemaValid(evt))
    throw new Error("can't serialize event with wrong or missing properties");

  return JSON.stringify([
    0,
    evt.pubkey,
    evt.created_at,
    evt.kind,
    evt.tags,
    evt.content,
  ]);
}

export function getEventHash(event: EventData): string {
  let eventHash = sha256(utf8Encoder.encode(serializeEvent(event)));
  return bytesToHex(eventHash);
}

/** Verify the event's signature. This function mutates the event with a `verified` symbol, making it idempotent. */
export function isSignatureValid(
  event: EventWithVerification
): event is EventWithVerification {
  if (typeof event?.verified === "boolean") return event.verified;

  const hash = getEventHash(event);
  if (hash !== event.id) {
    return (event.verified = false);
  }

  try {
    return (event.verified = schnorr.verify(event.sig, hash, event.pubkey));
  } catch (err) {
    return (event.verified = false);
  }
}
