import { WebSocket } from "ws";
import { ConnectionManagerInterface } from "./types/connection";
import { EventData, EventFromClient } from "./types/nostrData";
import { isSignatureValid } from "./utils/eventUtils";
import { Configs } from "./types/configs";
import { AllConnections } from "./connectionsMap";

enum ConnectionStatus {
  CONNECTED,
  PROMPT_SENT,
  USER_VERIFIED,
}

export class WsConnectionManager implements ConnectionManagerInterface {
  private status: ConnectionStatus;
  private promptString: string;
  private userPubkey: string;
  private identifier: string;
  private connMapsRef: AllConnections;

  public constructor(
    private readonly websocket: WebSocket,
    private readonly configs: Configs
  ) {
    this.status = ConnectionStatus.CONNECTED;
    this.websocket.on("message", this.onMessage.bind(this));
    this.promptString = "";
    this.userPubkey = "";
    this.identifier =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    this.connMapsRef = AllConnections.getInstance();
    this.connMapsRef.addUnverifiedConnection(this.identifier, this);
  }

  protected async onMessage(rawMessage: string) {
    const messageObj = JSON.parse(rawMessage);
    try {
      const eventMessage = messageObj as EventFromClient;
      const eventObj = eventMessage[1];
      if (
        !this.isEventMessageRelevant(eventObj) ||
        !isSignatureValid(eventObj)
      ) {
        return;
      }

      if (this.userPubkey && this.userPubkey !== eventObj.pubkey) {
        return;
      }
      this.userPubkey = eventObj.pubkey;

      switch (this.status) {
        case ConnectionStatus.CONNECTED:
          // Once the opening message is received, (`Hello ${configs.relay.url}`), send a random string.
          const contentWords = eventObj.content.split(" ");
          if (
            contentWords.length > 1 &&
            contentWords[0].toLowerCase().trim() === "hello" &&
            contentWords[1].trim() === this.configs.relay.url
          ) {
            this.promptString =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
            await this.sendOkMessage(eventObj, true, this.promptString);
            this.status = ConnectionStatus.PROMPT_SENT;
          } else {
            await this.sendOkMessage(
              eventObj,
              false,
              "Invalid opening message sent."
            );
          }
          break;

        case ConnectionStatus.PROMPT_SENT:
          // If the random prompt is received as a signed message, accept the user.
          if (eventObj.content === this.promptString) {
            await this.sendOkMessage(eventObj, true);
            this.connMapsRef.addConnection(this.userPubkey, this);
            this.connMapsRef.removeUnverifiedConnection(this.identifier);
            this.identifier = this.userPubkey;
            this.status = ConnectionStatus.USER_VERIFIED;
          } else {
            await this.sendOkMessage(
              eventObj,
              false,
              "Invalid prompt response sent."
            );
          }
          break;
        case ConnectionStatus.USER_VERIFIED:
          const recipientPubkey = this.getFirstRecipient(eventObj);
          if (recipientPubkey) {
            await this.connMapsRef.sendToApp(recipientPubkey, rawMessage);
          }

        default:
          break;
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }

  public send(message: string) {
    this.websocket.send(message);
  }

  private async sendOkMessage(
    event: EventData,
    result: boolean,
    message?: string
  ) {
    const okMessage = ["OK", event.id, result, message || ""];
    const okMessageString = JSON.stringify(okMessage);
    await this.websocket.send(okMessageString);
  }

  private isEventMessageRelevant(event: EventData): boolean {
    if (!this.configs.event.kinds.includes(event.kind)) {
      return false;
    }
    if (this.configs.app.appPubkeys.includes(event.pubkey)) {
      return true;
    }
    const recipient = this.getFirstRecipient(event);
    if (recipient && this.configs.app.appPubkeys.includes(recipient)) {
      return true;
    }

    return false;
  }

  private getFirstRecipient(event: EventData): string | null {
    if (event.tags) {
      for (const tag of event.tags) {
        if (tag.length > 1 && tag[0] === "p") {
          return tag[1];
        }
      }
    }
    return null;
  }

  public getIdentifier(): string {
    return this.identifier;
  }
}
