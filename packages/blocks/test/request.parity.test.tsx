import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Request } from "../src/api/request/react.js";
import { runGoldenParity } from "./helpers/run-golden-parity.js";

const blockDir = join(dirname(fileURLToPath(import.meta.url)), "../src/api/request");

runGoldenParity("api/request", {
  blockDir,
  Component: Request,
  variants: [
    // propsRaw embeds double quotes inside backtick strings — the naive parser can't handle them
    {
      label: "delete · custom copy",
      props: {
        method: "DELETE",
        endpoint: "/v1/api-keys/key_2Xf8",
        status: 204,
        statusText: "No Content",
        latency: "38ms",
        response: ['{ "deleted": true, "id": "key_2Xf8" }'],
      },
    },
    {
      label: "patch · custom copy",
      props: {
        method: "PATCH",
        endpoint: "/v1/workspaces/ws_71Ka",
        status: 200,
        statusText: "OK",
        latency: "112ms",
        response: ['{ "id": "ws_71Ka", "name": "Acme Labs", "members": 12 }'],
      },
    },
  ],
});
