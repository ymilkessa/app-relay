export interface ConnectionManagerInterface {
  send: (message: string) => void;
  getIdentifier: () => string;
}
