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
    await app.listen({ port: PORT, host: HOST });
    console.log(`Server listening on http://${HOST}:${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

export default app;
