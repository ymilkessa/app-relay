import { WebSocket } from "ws";
import { ConnectionManagerInterface, HostBlackBox } from "./types/components";
import { EventData, EventFromClient } from "./types/nostrData";
import { isSignatureValid } from "./utils/eventUtils";
import { Configs } from "./types/configs";
import { AllConnections } from "./connectionsMap";
import { RelayResponseTypes } from "nostr-bot-app";

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
  private hostInterface: HostBlackBox = () => {};

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

      const result = await this.hostInterface(eventObj);
      if (result) {
        await this.sendOkMessage(eventObj, true);
        await this.sendEventToUser(result);
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

  /**
   * Send back an event. Set the subscription id to just be "", since there are no
   * subscriptions in this case.
   */
  private sendEventToUser(event: EventData) {
    const eventMessage = [RelayResponseTypes.EVENT, "", event];
    this.websocket.send(JSON.stringify(eventMessage, null, 2));
  }

  private isEventMessageRelevant(event: EventData): boolean {
    if (!this.configs.event.kinds.includes(event.kind)) {
      return false;
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

  public setHostInterface(hostFunc: HostBlackBox) {
    this.hostInterface = hostFunc;
  }

  public getIdentifier(): string {
    return this.identifier;
  }
}
