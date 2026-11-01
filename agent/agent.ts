import { anthropic } from "eve/models/anthropic";

import { defineAgent } from "eve";

export default defineAgent({
  model: anthropic("claude-sonnet-5"),
  experimental: {
    workflow: {
      // Signed-in web sessions are private. The default outside development
      // deletes their transcript when the session ends, so a /s/:id link would
      // come back empty. Keep the world's normal retention instead.
      retention: "default",
    },
  },
});
