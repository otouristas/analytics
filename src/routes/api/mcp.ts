import { createFileRoute } from "@tanstack/react-router";
import { listEvents, summarize } from "@/lib/analytics/ingest";
import { scanAnomalies } from "@/lib/analytics/anomaly-radar";
import { computeAttribution } from "@/lib/analytics/attribution-engine";
import { generateForecast } from "@/lib/analytics/forecast";
import { PROJECTS } from "@/lib/analytics/projects";
import { sessionsFromEvents, livePeople } from "@/lib/analytics/realtime";
import { goalStats } from "@/lib/analytics/goals";
import { destinationDemand } from "@/lib/analytics/demand";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const MCP_TOOLS = [
  {
    name: "get_live_metrics",
    description: "Fetch live concurrent visitors, active sessions, pageviews, and core web vitals for a property.",
    inputSchema: {
      type: "object",
      properties: {
        writeKey: { type: "string", description: "Property write key or project id (e.g. mk_cyclades, mk_live_demo)" },
      },
    },
  },
  {
    name: "scan_anomalies",
    description: "Scan real-time event stream for statistical anomalies, traffic drops/spikes, rage clicks, and JavaScript errors.",
    inputSchema: {
      type: "object",
      properties: {
        writeKey: { type: "string", description: "Property write key" },
      },
    },
  },
  {
    name: "get_attribution",
    description: "Compute multi-touch attribution (First-touch, Last-touch, Linear, Markov Chain removal effect) across inbound channels.",
    inputSchema: {
      type: "object",
      properties: {
        writeKey: { type: "string", description: "Property write key" },
      },
    },
  },
  {
    name: "get_forecast",
    description: "Generate Holt-Winters time-series forecast with confidence intervals for traffic and destination demand.",
    inputSchema: {
      type: "object",
      properties: {
        horizon: { type: "number", description: "Forecast horizon in days (default 14)" },
      },
    },
  },
];

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),
      GET: () => {
        return Response.json(
          {
            name: "meridian-analytics-mcp",
            version: "2.0.0",
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            tools: MCP_TOOLS,
          },
          { headers: CORS },
        );
      },
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
        }

        const method = String(body.method || "");
        const id = body.id ?? 1;

        if (method === "tools/list" || method === "list_tools") {
          return Response.json({ jsonrpc: "2.0", id, result: { tools: MCP_TOOLS } }, { headers: CORS });
        }

        if (method === "tools/call" || method === "call_tool") {
          const params = (body.params as { name?: string; arguments?: Record<string, unknown> }) || {};
          const toolName = params.name || String(body.name || "");
          const args = params.arguments || (body.arguments as Record<string, unknown>) || {};
          const key = String(args.writeKey || "mk_cyclades");

          const project = PROJECTS.find((p) => p.writeKey === key || p.id === key) ?? PROJECTS[0]!;
          const events = listEvents(0).filter((e) => !project.writeKey || e.writeKey === project.writeKey || key === "all");
          const people = sessionsFromEvents(events);
          const live = livePeople(people);

          if (toolName === "get_live_metrics") {
            const stats = summarize(events);
            const goals = goalStats(people);
            const demand = destinationDemand(people);
            return Response.json(
              {
                jsonrpc: "2.0",
                id,
                result: {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify({
                        property: project.name,
                        host: project.host,
                        liveVisitors: live.length,
                        totalSessions: people.length,
                        pageviews: stats.pageviews,
                        clicks: stats.clicks,
                        outbound: stats.outbound,
                        goalsHit: goals.converted,
                        topDestinations: demand.slice(0, 5),
                      }, null, 2),
                    },
                  ],
                },
              },
              { headers: CORS },
            );
          }

          if (toolName === "scan_anomalies") {
            const report = scanAnomalies(events, people);
            return Response.json(
              {
                jsonrpc: "2.0",
                id,
                result: {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify(report, null, 2),
                    },
                  ],
                },
              },
              { headers: CORS },
            );
          }

          if (toolName === "get_attribution") {
            const attribution = computeAttribution(people);
            return Response.json(
              {
                jsonrpc: "2.0",
                id,
                result: {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify(attribution, null, 2),
                    },
                  ],
                },
              },
              { headers: CORS },
            );
          }

          if (toolName === "get_forecast") {
            const horizon = Number(args.horizon || 14);
            const history = people.map((_, i) => Math.max(1, i + 1));
            const forecast = generateForecast(history, horizon, [], "Active Sessions");
            return Response.json(
              {
                jsonrpc: "2.0",
                id,
                result: {
                  content: [
                    {
                      type: "text",
                      text: JSON.stringify(forecast, null, 2),
                    },
                  ],
                },
              },
              { headers: CORS },
            );
          }

          return Response.json(
            { jsonrpc: "2.0", id, error: { code: -32601, message: `Method or tool '${toolName}' not found` } },
            { status: 404, headers: CORS },
          );
        }

        return Response.json(
          {
            jsonrpc: "2.0",
            id,
            result: {
              serverInfo: { name: "meridian-mcp", version: "2.0.0" },
              capabilities: { tools: {} },
            },
          },
          { headers: CORS },
        );
      },
    },
  },
});
