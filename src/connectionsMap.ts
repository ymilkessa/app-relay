import { ConnectionManagerInterface } from "./types/connection";

/**
 * Define a singleton class that includes a map from public keys to ConnectionManagerInterface instances.
 */
export class AllConnections {
  private static instance: AllConnections;
  private connections: Map<string, ConnectionManagerInterface>;
  private unverifiedConnections: Map<string, ConnectionManagerInterface>;

  private constructor() {
    this.connections = new Map<string, ConnectionManagerInterface>();
    this.unverifiedConnections = new Map<string, ConnectionManagerInterface>();
  }

  public static getInstance(): AllConnections {
    if (!AllConnections.instance) {
      AllConnections.instance = new AllConnections();
    }

    return AllConnections.instance;
  }

  public addConnection(pubkey: string, connection: ConnectionManagerInterface) {
    this.connections.set(pubkey, connection);
  }

  public async sendToApp(appPubkey: string, message: string) {
    const connection = this.connections.get(appPubkey);
    if (connection) {
      await connection.send(message);
    }
  }

  public isAppConnected(appPubkey: string): boolean {
    return this.connections.has(appPubkey);
  }

  public addUnverifiedConnection(
    identifier: string,
    connection: ConnectionManagerInterface
  ) {
    this.unverifiedConnections.set(identifier, connection);
  }

  public removeUnverifiedConnection(identifier: string) {
    this.unverifiedConnections.delete(identifier);
  }
}
