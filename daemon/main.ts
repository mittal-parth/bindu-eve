import { connectDiscordCredentials } from "@vercel/connect/eve";
import { getVercelOidcToken } from "@vercel/oidc";
import { runDiscordGatewayRelay } from "eve/experimental/channels/discord/gateway";

await runDiscordGatewayRelay({
  credentials: connectDiscordCredentials("discord/bindu-eve"),
  // Lets thread follow-ups that don't mention the bot arrive with their text. Needs
  // Message Content Intent under Bot in the Discord Developer Portal, or Discord refuses the relay.
  messageContent: true,
  // Defaults to the project's production URL; set EVE_URL to relay to `eve dev`.
  url: process.env.EVE_URL,
  // eve bundles @vercel/oidc 3.8, which only reads VERCEL_OIDC_TOKEN. A Vercel
  // Daemon exposes the token through VERCEL_OIDC_TOKEN_FILE, so read it here on
  // each forward. The file rotates about every five minutes.
  auth: async () => {
    const token = await getVercelOidcToken();
    return {
      headers: {
        authorization: `Bearer ${token}`,
        "x-vercel-trusted-oidc-idp-token": token,
      },
    };
  },
});
