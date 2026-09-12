import { FastifyInstance } from "fastify";
import invoiceController from "../controllers/invoice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const ALLOWED_ROLES = ["superadmin", "admin", "businessowner"];

export default async function invoiceRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", authMiddleware);
  fastify.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));

  // CREATE INVOICE
  fastify.post("/client/:client_id/invoices", invoiceController.createInvoice);

  // GET ALL INVOICES
  fastify.get("/client/:client_id/invoices", invoiceController.getAllInvoices);

  // GET INVOICE BY ID
  fastify.get("/client/:client_id/invoices/:id", invoiceController.getInvoiceById);

  // UPDATE INVOICE
  fastify.put("/client/:client_id/invoices/:id", invoiceController.updateInvoice);

  // DELETE INVOICE
  fastify.delete("/client/:client_id/invoices/:id", invoiceController.deleteInvoice);

  // DOWNLOAD PDF
  fastify.get("/client/:client_id/invoices/:id/pdf", invoiceController.downloadInvoicePdf);

  // PREVIEW HTML
  fastify.get("/client/:client_id/invoices/:id/preview", invoiceController.previewInvoiceHtml);
}
