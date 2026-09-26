import Fastify from "fastify";
import dotenv from "dotenv";
import fastifyCors from "@fastify/cors";

import sequelize from "./config/db";
import authRoutes from "./routes/auth.routes";
import clientRoutes from "./routes/client.routes";
import userRoutes from "./routes/user.routes";
import productCategoryRoutes from "./routes/productCategory.routes";
import medicalProductRoutes from "./routes/medicalProduct.routes";
import medicalStoreRoutes from "./routes/medicalStore.routes";
import invoiceRoutes from "./routes/invoice.routes";

import { addRealtimeClient, removeRealtimeClient } from "./utils/realtime";

dotenv.config();

export const app = Fastify({ logger: true });

// ─── JSON body parser ─────────────────────────────────────────────────────────
app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body: string, done) => {
  if (!body || body.trim() === "") {
    done(null, null);
    return;
  }
  try {
    done(null, JSON.parse(body));
  } catch (err: any) {
    err.statusCode = 400;
    done(err, undefined);
  }
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

// ─── Routes (one file per controller) ────────────────────────────────────────
app.register(authRoutes,            { prefix: "/auth" });
app.register(clientRoutes,          { prefix: "/client" });
app.register(userRoutes,            { prefix: "/user" });
app.register(productCategoryRoutes, { prefix: "/product-category" });
app.register(medicalProductRoutes,  { prefix: "/medical-product" });
app.register(medicalStoreRoutes,    { prefix: "/medical-store" });
app.register(invoiceRoutes);

// ─── Realtime Server-Sent Events (SSE) Live Stream ───────────────────────────
app.get("/client/:client_id/realtime-stream", (request, reply) => {
  const { client_id } = request.params as { client_id: string };
  const raw = reply.raw;

  raw.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });
  raw.write(`data: ${JSON.stringify({ type: "CONNECTED", clientId: client_id, timestamp: Date.now() })}\n\n`);

  addRealtimeClient(client_id, raw);

  // Keep-alive heartbeat every 20 seconds to prevent proxy / Render connection drops
  const heartbeat = setInterval(() => {
    try {
      raw.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
      removeRealtimeClient(client_id, raw);
    }
  }, 20000);

  request.raw.on("close", () => {
    clearInterval(heartbeat);
    removeRealtimeClient(client_id, raw);
  });
});

// ─── Health Check Route ───────────────────────────────────────────────────────
app.get("/health", async (request, reply) => {
  return reply.send({ message: "system is healthy" });
});

// ─── Server start ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Auto-migrate: ensure customer_type column exists on live database
    try {
      await sequelize.query("ALTER TABLE medical_stores ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'store';");
      console.log("Auto-migration: customer_type column verified.");
    } catch (err: any) {
      console.warn("Auto-migration notice:", err.message);
    }
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server listening on http://${HOST}:${PORT}`);

    // 24/7 Keep-Alive Self-Ping: prevents Render free tier from sleeping after 15m of inactivity
    const PING_INTERVAL_MS = 9 * 60 * 1000; // Ping every 9 minutes
    setInterval(() => {
      const pingUrl = process.env.RENDER_EXTERNAL_URL || "https://animex-billing-backend.onrender.com";
      fetch(`${pingUrl}/health`)
        .then(() => console.log("Render 24/7 Keep-Alive Ping Sent successfully"))
        .catch((err) => console.warn("Keep-Alive Ping notice:", err.message));
    }, PING_INTERVAL_MS);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
