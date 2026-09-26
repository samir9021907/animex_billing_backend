import { FastifyRequest, FastifyReply } from "fastify";
import invoiceService from "../services/invoice.service";
import medicalStoreService from "../services/medical_store.service";
import medicalProductService from "../services/medical_product.service";
import { validateUUID, validateArray, validateString, validateNumber } from "../utils/validation.util";
import { broadcastRealtimeEvent } from "../utils/realtime";

class InvoiceController {
    // CREATE
    async createInvoice(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const payload = (request.body as any) || {};

            // 1. Validate Medical Store ID
            const storeValidation = validateUUID(payload.medical_store_id, "Medical Store (मेडिकल स्टोअर)", true);
            if (!storeValidation.isValid) {
                return reply.code(400).send({
                    success: false,
                    message: storeValidation.error
                });
            }

            // 2. Validate Items Array (must have at least 1 item)
            const itemsValidation = validateArray(payload.items, "Invoice Items (इनव्हॉइस उत्पादने)", 1);
            if (!itemsValidation.isValid) {
                return reply.code(400).send({
                    success: false,
                    message: itemsValidation.error
                });
            }

            // 3. Validate each item's title, quantity, and price
            const validatedItems: any[] = [];
            for (let i = 0; i < itemsValidation.value!.length; i++) {
                const it = itemsValidation.value![i];
                const titleVal = validateString(it.product_title, `Item #${i + 1} Product Title`, 1, 250, true);
                if (!titleVal.isValid) {
                    return reply.code(400).send({ success: false, message: titleVal.error });
                }

                const qtyVal = validateNumber(it.quantity, `Item #${i + 1} Quantity`, 0.01, 10000000, true);
                if (!qtyVal.isValid) {
                    return reply.code(400).send({ success: false, message: qtyVal.error });
                }

                const priceVal = validateNumber(it.selling_price ?? it.price_per_unit, `Item #${i + 1} Price`, 0, 10000000, false);
                if (!priceVal.isValid) {
                    return reply.code(400).send({ success: false, message: priceVal.error });
                }

                validatedItems.push({
                    ...it,
                    product_title: titleVal.value,
                    quantity: qtyVal.value,
                    selling_price: it.is_free ? 0 : priceVal.value,
                });
            }

            // 4. Validate Discount
            let discount = 0;
            if (payload.discount !== undefined && payload.discount !== null && payload.discount !== "") {
                const discVal = validateNumber(payload.discount, "Discount (सूट)", 0, 10000000, false);
                if (!discVal.isValid) {
                    return reply.code(400).send({ success: false, message: discVal.error });
                }
                discount = discVal.value || 0;
            }

            // 5. Validate GST Rate
            let gstRate = 5.0;
            if (payload.gst_rate !== undefined && payload.gst_rate !== null && payload.gst_rate !== "") {
                const gstVal = validateNumber(payload.gst_rate, "GST Rate", 0, 100, false);
                if (!gstVal.isValid) {
                    return reply.code(400).send({ success: false, message: gstVal.error });
                }
                gstRate = gstVal.value!;
            }

            // 6. Validate Received Amount
            let receivedAmount = 0;
            if (payload.received_amount !== undefined && payload.received_amount !== null && payload.received_amount !== "") {
                const recVal = validateNumber(payload.received_amount, "Received Amount (जमा रक्कम)", 0, 100000000, false);
                if (!recVal.isValid) {
                    return reply.code(400).send({ success: false, message: recVal.error });
                }
                receivedAmount = recVal.value || 0;
            }

            const body = {
                ...payload,
                client_id,
                medical_store_id: storeValidation.value,
                items: validatedItems,
                discount,
                gst_rate: gstRate,
                received_amount: receivedAmount,
            };

            const invoice = await invoiceService.createInvoice(body);

            // Instant Real-Time Push to all connected devices (mobile, laptop)
            broadcastRealtimeEvent(client_id, {
                type: "DATA_CHANGED",
                entity: "invoice",
                action: "create",
                invoiceId: invoice?.id,
            });

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
            const payload = (request.body as any) || {};
            const updateBody: any = { client_id };

            // Validate medical_store_id if provided
            if (payload.medical_store_id !== undefined) {
                const storeValidation = validateUUID(payload.medical_store_id, "Medical Store", true);
                if (!storeValidation.isValid) {
                    return reply.code(400).send({ success: false, message: storeValidation.error });
                }
                updateBody.medical_store_id = storeValidation.value;
            }

            // Validate items if provided
            if (payload.items !== undefined) {
                const itemsValidation = validateArray(payload.items, "Invoice Items", 1);
                if (!itemsValidation.isValid) {
                    return reply.code(400).send({ success: false, message: itemsValidation.error });
                }

                const validatedItems: any[] = [];
                for (let i = 0; i < itemsValidation.value!.length; i++) {
                    const it = itemsValidation.value![i];
                    const titleVal = validateString(it.product_title, `Item #${i + 1} Product Title`, 1, 250, true);
                    if (!titleVal.isValid) {
                        return reply.code(400).send({ success: false, message: titleVal.error });
                    }
                    const qtyVal = validateNumber(it.quantity, `Item #${i + 1} Quantity`, 0.01, 10000000, true);
                    if (!qtyVal.isValid) {
                        return reply.code(400).send({ success: false, message: qtyVal.error });
                    }
                    const priceVal = validateNumber(it.selling_price ?? it.price_per_unit, `Item #${i + 1} Price`, 0, 10000000, false);
                    if (!priceVal.isValid) {
                        return reply.code(400).send({ success: false, message: priceVal.error });
                    }
                    validatedItems.push({
                        ...it,
                        product_title: titleVal.value,
                        quantity: qtyVal.value,
                        selling_price: it.is_free ? 0 : priceVal.value,
                    });
                }
                updateBody.items = validatedItems;
            }

            // Validate discount if provided
            if (payload.discount !== undefined && payload.discount !== null) {
                const discVal = validateNumber(payload.discount, "Discount", 0, 10000000, false);
                if (!discVal.isValid) {
                    return reply.code(400).send({ success: false, message: discVal.error });
                }
                updateBody.discount = discVal.value;
            }

            // Validate gst_rate if provided
            if (payload.gst_rate !== undefined && payload.gst_rate !== null) {
                const gstVal = validateNumber(payload.gst_rate, "GST Rate", 0, 100, false);
                if (!gstVal.isValid) {
                    return reply.code(400).send({ success: false, message: gstVal.error });
                }
                updateBody.gst_rate = gstVal.value;
            }

            // Validate received_amount if provided
            if (payload.received_amount !== undefined && payload.received_amount !== null) {
                const recVal = validateNumber(payload.received_amount, "Received Amount", 0, 100000000, false);
                if (!recVal.isValid) {
                    return reply.code(400).send({ success: false, message: recVal.error });
                }
                updateBody.received_amount = recVal.value;
            }

            // Copy other optional fields
            if (payload.status !== undefined) updateBody.status = payload.status;
            if (payload.payment_type !== undefined) updateBody.payment_type = payload.payment_type;
            if (payload.notes !== undefined) updateBody.notes = payload.notes;
            if (payload.date !== undefined) updateBody.date = payload.date;

            const invoice = await invoiceService.updateInvoice(id, updateBody);

            if (!invoice) {
                return reply.code(404).send({
                    success: false,
                    message: "Invoice not found for update"
                });
            }

            broadcastRealtimeEvent(client_id, {
                type: "DATA_CHANGED",
                entity: "invoice",
                action: "update",
                invoiceId: id,
            });

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

            broadcastRealtimeEvent(client_id, {
                type: "DATA_CHANGED",
                entity: "invoice",
                action: "delete",
                invoiceId: id,
            });

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

    // UNIFIED FAST SYNC (Stores + Invoices + Products in 1 Parallel Query)
    async syncAll(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const [stores, invoices, products] = await Promise.all([
                medicalStoreService.getAllStores({ client_id }),
                invoiceService.getAllInvoices({ client_id }),
                medicalProductService.getAllProducts({ client_id }),
            ]);

            return reply.send({
                success: true,
                data: {
                    stores,
                    invoices,
                    products,
                    serverTime: new Date().toISOString(),
                }
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: "Error performing unified sync",
                error: error.message || error,
            });
        }
    }
}

export default new InvoiceController();
