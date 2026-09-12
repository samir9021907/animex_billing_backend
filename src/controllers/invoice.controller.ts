import { FastifyRequest, FastifyReply } from "fastify";
import invoiceService from "../services/invoice.service";

class InvoiceController {
    // CREATE
    async createInvoice(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const body = {
                ...(request.body as any),
                client_id
            };

            const invoice = await invoiceService.createInvoice(body);

            return reply.code(201).send({
                success: true,
                message: "Invoice created successfully",
                data: invoice
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error creating invoice",
                error: error.message || error
            });
        }
    }

    // GET ALL
    async getAllInvoices(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const query = {
                ...(request.query as any),
                client_id
            };

            const invoices = await invoiceService.getAllInvoices(query);

            return reply.send({
                success: true,
                data: invoices
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching invoices",
                error: error.message || error
            });
        }
    }

    // GET BY ID
    async getInvoiceById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const invoice = await invoiceService.getInvoiceById(id, client_id);

            if (!invoice) {
                return reply.code(404).send({
                    success: false,
                    message: "Invoice not found"
                });
            }

            return reply.send({
                success: true,
                data: invoice
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error fetching invoice",
                error: error.message || error
            });
        }
    }

    // UPDATE
    async updateInvoice(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const body = {
                ...(request.body as any),
                client_id
            };

            const invoice = await invoiceService.updateInvoice(id, body);

            if (!invoice) {
                return reply.code(404).send({
                    success: false,
                    message: "Invoice not found for update"
                });
            }

            return reply.send({
                success: true,
                message: "Invoice updated successfully",
                data: invoice
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error updating invoice",
                error: error.message || error
            });
        }
    }

    // DELETE
    async deleteInvoice(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const invoice = await invoiceService.getInvoiceById(id, client_id);
            if (!invoice) {
                return reply.code(404).send({
                    success: false,
                    message: "Invoice not found"
                });
            }

            await invoiceService.deleteInvoice(id, client_id);

            return reply.send({
                success: true,
                message: "Invoice deleted successfully"
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error deleting invoice",
                error: error.message || error
            });
        }
    }

    // DOWNLOAD PDF
    async downloadInvoicePdf(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const invoice = await invoiceService.getInvoiceById(id, client_id);
            if (!invoice) {
                return reply.code(404).send({
                    success: false,
                    message: "Invoice not found"
                });
            }

            const pdfBuffer = await invoiceService.generateInvoicePdf(invoice);

            const pdfInvoiceNumber = invoice.company_invoice_number || invoice.invoice_number;
            return reply
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", `attachment; filename=invoice_${pdfInvoiceNumber}.pdf`)
                .send(pdfBuffer);
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error generating invoice PDF",
                error: error.message || error
            });
        }
    }

    // PREVIEW HTML
    async previewInvoiceHtml(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const invoice = await invoiceService.getInvoiceById(id, client_id);
            if (!invoice) {
                return reply.code(404).send({
                    success: false,
                    message: "Invoice not found"
                });
            }

            const html = invoiceService.renderInvoiceHtml(invoice);

            return reply
                .header("Content-Type", "text/html")
                .send(html);
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error rendering invoice preview",
                error: error.message || error
            });
        }
    }
}

export default new InvoiceController();
