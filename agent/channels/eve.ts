import { localDev, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";
import { supabaseAuth } from "../lib/supabase-auth";

export default eveChannel({
  auth: [
    // Signed-in web chat. A bearer token is required; other callers fall through.
    supabaseAuth(),
    // Lets the eve TUI and your Vercel deployments reach the deployed agent.
    vercelOidc(),
    // Open on localhost for `eve dev` and the REPL; ignored in production.
    localDev(),
  ],
});
