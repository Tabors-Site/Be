import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import "dotenv/config";

// Store request body per requestId
const requestContext = new Map();

const apiUrl = process.env.TREE_API_URL;
const HOST = "127.0.0.1";

// === Helper ===
async function getTreeData(rootId) {
  console.log(`[getTreeData] Starting fetch for rootId: ${rootId}`);
  console.log(`[getTreeData] API URL: ${apiUrl}/get-tree`);

  try {
    const headers = { "Content-Type": "application/json" };
    const res = await fetch(`${apiUrl}/get-tree-ai`, {
      method: "POST",
      headers,
      body: JSON.stringify({ rootId }),
    });

    console.log(`[getTreeData] Response status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[getTreeData] Error response: ${errorText}`);
      throw new Error(`Backend ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log(
      `[getTreeData] Successfully fetched data, size: ${
        JSON.stringify(data).length
      } chars`
    );
    
    return data;
  } catch (err) {
    console.error("[getTreeData] Exception:", err);
    return null;
  }
}

function getServer() {
  const server = new McpServer({
    name: "tree-helper",
    version: "1.0.0",
  });

  console.log("[getServer] Server properties:", Object.keys(server));

  server.tool(
    "ask-tree-question",
    "Ask a question about the user's tree",
    {
      question: {
        type: "string",
        description: "The question to ask about the tree",
      },
      rootId: { type: "string", description: "The root ID of the tree" },
    },
    async (args) => {
      console.log("[Tool] Raw args:", JSON.stringify(args, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (key === '_events' || key === '_eventsCount' || key === '_handler') {
            return undefined;
          }
        }
        return value;
      }, 2));
      console.log("[Tool] args keys:", Object.keys(args));
      console.log("[Tool] args._meta:", JSON.stringify(args._meta, null, 2));
      console.log("[Tool] args.requestInfo:", JSON.stringify(args.requestInfo, null, 2));
      console.log("[Tool] args.requestId:", args.requestId);
      console.log("[Tool] args.sessionId:", args.sessionId);
      console.log("[Tool] args.authInfo:", JSON.stringify(args.authInfo, null, 2));

      // Access request body from context
      const requestBody = requestContext.get(args.requestId) || {};
      console.log("[Tool] Full request body:", JSON.stringify(requestBody, null, 2));

      // Extract arguments from request body or args
      const { question, rootId } = args._originalRequest?.params?.arguments || 
                                  args.arguments || 
                                  args._meta?.arguments || 
                                  args.requestInfo?.arguments || 
                                  requestBody.params?.arguments || 
                                  args;
      console.log("[Tool] Called with:", { question, rootId });

      const treeData = await getTreeData(rootId);
      console.log("[Tool] Fetch complete, treeData is:", treeData ? "present" : "null");

      if (!treeData) {
        return {
          content: [{ type: "text", text: "❌ Could not fetch tree data." }],
        };
      }

      return {
        content: [{ type: "text", text: JSON.stringify(treeData) }],
      };
    }
  );

  return server;
}

const app = express();
app.use(express.json({ limit: "30mb" }));


app.post("/mcp", async (req, res) => {
  console.log("\n=== NEW REQUEST ===");
  console.log("Received request:", JSON.stringify(req.body, null, 2));

  try {
    const server = getServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    console.log("[MCP Handler] Transport properties:", Object.keys(transport));

    // Store request body with requestId
    const requestId = req.body.id;
    requestContext.set(requestId, req.body);

    res.on("close", () => {
      console.log("=== REQUEST CLOSED ===\n");
      // Clean up request context
      requestContext.delete(requestId);
      transport.close();
      server.close();
    });

    await server.connect(transport);

    // Flatten params.arguments
    let requestBody = req.body;
    if (req.body.method === "tools/call" && req.body.params?.arguments) {
      requestBody = {
        ...req.body,
        params: {
          name: req.body.params.name,
          ...req.body.params.arguments, // Spread question and rootId
        },
      };
      console.log("[MCP Handler] Modified request body:", JSON.stringify(requestBody, null, 2));
    }

    console.log("Handling request...");
    await transport.handleRequest(req, res, requestBody);

    console.log("[MCP Handler] Server properties after handleRequest:", Object.keys(server));
    console.log("Request handled successfully");
  } catch (error) {
    console.error("Error in handler:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: req.body.id || null,
      });
    }
  }
});

const PORT = 3005;
app.listen(PORT, async () => {
  console.log(`MCP RUNNING ON PORT ${PORT}`);
  console.log(`API URL: ${apiUrl}`);
});