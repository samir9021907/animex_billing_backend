import { FastifyRequest, FastifyReply } from "fastify";
import userService from "../services/user.service";
import { validateString, validatePhoneNumber, validateEmail } from "../utils/validation.util";

class UserController {

    // CREATE
    async createUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const payload = (request.body as any) || {};

            // 1. Validate Name
            const nameVal = validateString(payload.name, "User Name (वापरकर्त्याचे नाव)", 2, 150, true);
            if (!nameVal.isValid) {
                return reply.code(400).send({ success: false, message: nameVal.error });
            }

            // 2. Validate Phone if provided
            let phone = null;
            if (payload.phone !== undefined && payload.phone !== null && String(payload.phone).trim() !== "") {
                const phoneVal = validatePhoneNumber(payload.phone, "Phone Number", false);
                if (!phoneVal.isValid) {
                    return reply.code(400).send({ success: false, message: phoneVal.error });
                }
                phone = phoneVal.value;
            }

            // 3. Validate Email if provided
            let email = null;
            if (payload.email !== undefined && payload.email !== null && String(payload.email).trim() !== "") {
                const emailVal = validateEmail(payload.email, "Email", false);
                if (!emailVal.isValid) {
                    return reply.code(400).send({ success: false, message: emailVal.error });
                }
                email = emailVal.value;
            }

            // 4. Validate Password if provided
            if (payload.password !== undefined && payload.password !== null && String(payload.password).trim() !== "") {
                const passVal = validateString(payload.password, "Password", 4, 100, true);
                if (!passVal.isValid) {
                    return reply.code(400).send({ success: false, message: passVal.error });
                }
            }

            const body = {
                ...payload,
                name: nameVal.value,
                phone,
                email,
                client_id,
            };

            const user = await userService.createUser(body);

            return reply.code(201).send({
                success: true,
                message: "User created successfully",
                data: user,
            });
        } catch (error: any) {
            return reply.code(400).send({
                success: false,
                message: error.message || "Error creating user",
                error,
            });
        }
    }

    // GET ALL
    async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { client_id } = request.params as { client_id: string };
            const query = {
                ...(request.query as any),
                client_id,
            };

            const users = await userService.getAllUsers(query);

            return reply.send({
                success: true,
                data: users,
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message || "Error fetching users",
                error,
            });
        }
    }

    // GET BY ID
    async getUserById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const user = await userService.getUserById(id, client_id);

            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
            }

            return reply.send({
                success: true,
                data: user,
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message || "Error fetching user",
                error,
            });
        }
    }

    // UPDATE
    async updateUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };
            const payload = (request.body as any) || {};
            const updateBody: any = { client_id };

            if (payload.name !== undefined) {
                const nameVal = validateString(payload.name, "User Name", 2, 150, true);
                if (!nameVal.isValid) {
                    return reply.code(400).send({ success: false, message: nameVal.error });
                }
                updateBody.name = nameVal.value;
            }

            if (payload.phone !== undefined) {
                if (payload.phone === null || String(payload.phone).trim() === "") {
                    updateBody.phone = null;
                } else {
                    const phoneVal = validatePhoneNumber(payload.phone, "Phone Number", false);
                    if (!phoneVal.isValid) {
                        return reply.code(400).send({ success: false, message: phoneVal.error });
                    }
                    updateBody.phone = phoneVal.value;
                }
            }

            if (payload.email !== undefined) {
                if (payload.email === null || String(payload.email).trim() === "") {
                    updateBody.email = null;
                } else {
                    const emailVal = validateEmail(payload.email, "Email", false);
                    if (!emailVal.isValid) {
                        return reply.code(400).send({ success: false, message: emailVal.error });
                    }
                    updateBody.email = emailVal.value;
                }
            }

            if (payload.password !== undefined && payload.password !== null && String(payload.password).trim() !== "") {
                const passVal = validateString(payload.password, "Password", 4, 100, true);
                if (!passVal.isValid) {
                    return reply.code(400).send({ success: false, message: passVal.error });
                }
                updateBody.password = payload.password;
            }

            if (payload.role !== undefined) updateBody.role = payload.role;
            if (payload.enabled !== undefined) updateBody.enabled = payload.enabled;

            const user = await userService.updateUser(id, updateBody);

            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found for update",
                });
            }

            return reply.send({
                success: true,
                message: "User updated successfully",
                data: user,
            });
        } catch (error: any) {
            return reply.code(400).send({
                success: false,
                message: error.message || "Error updating user",
                error,
            });
        }
    }

    // DELETE
    async deleteUser(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id, client_id } = request.params as { id: string; client_id: string };

            const user = await userService.getUserById(id, client_id);
            if (!user) {
                return reply.code(404).send({
                    success: false,
                    message: "User not found",
                });
            }

            await userService.deleteUser(id, client_id);

            return reply.send({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error: any) {
            return reply.code(500).send({
                success: false,
                message: error.message || "Error deleting user",
                error,
            });
        }
    }
}

export default new UserController();
