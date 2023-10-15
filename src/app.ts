import express, { Request, Response } from "express";
import http from "http";
import WebSocket from "ws";
import { WsServerAdapter } from "./wsServerAdapter"; // Assuming you have this file in your project
import { getNostrAppConfigs } from "./utils/nostrConfigs";
import { Configs } from "./types/configs";

export class NostrApp {
  private wsAdapter: WsServerAdapter;
  private expressApp: express.Application;
  private server: http.Server;
  private configs: Configs;

  constructor() {
    this.configs = getNostrAppConfigs();

    this.expressApp = express();
    this.server = http.createServer(this.expressApp);
    const wss = new WebSocket.Server({ server: this.server });
    this.wsAdapter = new WsServerAdapter(wss, this.configs);
    this.expressApp.use(express.json());
    this.expressApp.use("/", this.appMiddleware);
  }

  public run() {
    const port = this.configs.app.internalPort;
    this.server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  }

  private async appMiddleware(req: Request, res: Response) {
    console.log("appMiddleware");
    console.log(req.body);
    res.send(
      "<body style='background-color:black; color:white;'><p>Please use a websocket client to connect to this server.</p></body>"
    );
  }
}
