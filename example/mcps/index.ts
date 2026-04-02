import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const smileMcp = require.resolve("@alegradev/smile-mcp");

const clientServer = new MultiServerMCPClient({
  throwOnLoadError: true, // this will throw an error if the server fails to load
  prefixToolNameWithServerName: true, // this will add a prefix for every tool name with the name of the server
  additionalToolNamePrefix: "",
  mcpServers: {
    smile: {
      type: "stdio",
      command: "node",
      args: [smileMcp],
    },
  },
});

export default clientServer;
