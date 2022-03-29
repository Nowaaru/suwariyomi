import { throttle } from 'lodash';
import DiscordRPC, { Presence } from 'discord-rpc';

// These are the hooks that are used to listen to events from main.ts.
// Should be present in every page component.

const RPCId = '956049974263689278';
DiscordRPC.register(RPCId);
export const RPCClient = new DiscordRPC.Client({ transport: 'ipc' });

let currentRPC: Presence;
let RPCEnabled = true;
let isInitialized = false;
export const updateRichPresence = throttle((data: Presence) => {
  currentRPC = data;
}, 15000);

setInterval(() => {
  if (currentRPC) RPCClient.setActivity(RPCEnabled ? currentRPC : {});
}, 15000);

export const toggleRPC = (enabled: boolean) => {
  RPCEnabled = enabled;
};

export default async () => {
  if (isInitialized) return;
  isInitialized = true;
  return RPCClient.login({ clientId: RPCId }).catch(console.error);
};
