import { WebSocket, WebSocketServer } from "ws";
import { WsConnectionManager } from "./wsConnectionManager";
import { Configs } from "./types/configs";
import { AllConnections } from "./connectionsMap";

export class WsServerAdapter {
  private allConnections: AllConnections;
  constructor(
    private readonly wsServer: WebSocketServer,
    private readonly configs: Configs
  ) {
    this.allConnections = AllConnections.getInstance();
    this.wsServer.on("connection", this.onConnection.bind(this));
  }

  private onConnection(websocket: WebSocket) {
    const connection = new WsConnectionManager(websocket, this.configs);
    this.allConnections.addUnverifiedConnection(
      connection.getIdentifier(),
      connection
    );
  }
}
