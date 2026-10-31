import { withEve } from "eve/vercel";

export default await withEve({
  daemons: {
    "discord-gateway": {
      root: "daemon",
      entrypoint: "Dockerfile",
      instances: {
        iad1: 1,
      },
    },
  },
  services: {
    web: {
      framework: "nextjs",
      root: "apps/web",
      buildCommand: "node ../../node_modules/next/dist/bin/next build",
    },
  },
  routes: [
    { src: "^(.*)$", destination: { type: "service", service: "web" } },
  ],
});
