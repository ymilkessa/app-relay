# Nostr event relayer

_Note: This is NOT a standard Nostr relay._

This relayer acts as a dedicated relay for a Nostr bot and bot-based applications. It simply receives an incoming Nostr message and forwards it to the bot. It does not save events or subscriptions.

## Why avoid using a standard Nostr relay?

Standard relays are not channels. They are buckets. You dump (or 'post') your events into them. Then your followers can retrieve them whenever they want.

This is not ideal for making application bots. You want to receive events as soon as they are sent, and then respond to them just as quickly. Furthermore, you can't subscribe to all of your potential users. And your users may not subscribe to you. This will prevent your app from reliably receiving incoming requests.

The current properties of Nostr are fit for the social-media use case. But they need to be pared down for making bot-applications.

## Characteristics

- No database. If the receiver is offline, the events are discarded.
- No subscriptions.

## How to use

1. Clone this repo
2. Create and fill in a configuration file in the `.nostr` folder. Call this file `nostr-configs.yml` (the format for this file is shown in `.nostr/example-nostr-configs.yml`)

3. Run `npm install && npm run build`
4. Run `npm start`

_Note: This is a working progress. More rigorous testing is underway_
