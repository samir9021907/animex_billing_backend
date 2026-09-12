import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.controller";
import clientController from "../controllers/client.controller";
import userController from "../controllers/user.controller";
import productCategoryController from "../controllers/product_category.controller";
import medicalProductController from "../controllers/medical_product.controller";
import medicalStoreController from "../controllers/medical_store.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const ALLOWED_ROLES = ["superadmin", "admin", "businessowner"];

export default async function router(fastify: FastifyInstance) {

  // ─────────────────────────────────────────────
  // AUTH  (public – no token required)
  // ─────────────────────────────────────────────
  const authController = new AuthController();
  fastify.post("/auth/signup", authController.signup);
  fastify.post("/auth/login", authController.login);

  // ─────────────────────────────────────────────
  // CLIENT  (mixed public / protected)
  // ─────────────────────────────────────────────
  fastify.post("/client/clients", clientController.createClient);
  fastify.get("/client/clients", clientController.getAllClients);

  fastify.register(async (protectedClient) => {
    protectedClient.addHook("preHandler", authMiddleware);
    protectedClient.get("/client/clients/:id", clientController.getClientById);
    protectedClient.put("/client/clients/:id", clientController.updateClient);
    protectedClient.delete("/client/clients/:id", clientController.deleteClient);
  });

  // ─────────────────────────────────────────────
  // USER  (mixed public / protected)
  // ─────────────────────────────────────────────
  fastify.post("/user/client/:client_id/users", userController.createUser);

  fastify.register(async (protectedUser) => {
    protectedUser.addHook("preHandler", authMiddleware);
    protectedUser.get("/user/client/:client_id/users", userController.getAllUsers);
    protectedUser.get("/user/client/:client_id/users/:id", userController.getUserById);
    protectedUser.put("/user/client/:client_id/users/:id", userController.updateUser);
    protectedUser.delete("/user/client/:client_id/users/:id", userController.deleteUser);
  });

  // ─────────────────────────────────────────────
  // PRODUCT CATEGORIES  (auth + role required)
  // ─────────────────────────────────────────────
  fastify.register(async (catRoute) => {
    catRoute.addHook("preHandler", authMiddleware);
    catRoute.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));
    catRoute.post("/product-category/client/:client_id/product-categories", productCategoryController.createCategory);
    catRoute.get("/product-category/client/:client_id/product-categories", productCategoryController.getAllCategories);
    catRoute.get("/product-category/client/:client_id/product-categories/:id", productCategoryController.getCategoryById);
    catRoute.put("/product-category/client/:client_id/product-categories/:id", productCategoryController.updateCategory);
    catRoute.delete("/product-category/client/:client_id/product-categories/:id", productCategoryController.deleteCategory);
  });

  // ─────────────────────────────────────────────
  // MEDICAL PRODUCTS  (auth + role required)
  // ─────────────────────────────────────────────
  fastify.register(async (productRoute) => {
    productRoute.addHook("preHandler", authMiddleware);
    productRoute.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));
    productRoute.post("/medical-product/client/:client_id/medical-products", medicalProductController.createProduct);
    productRoute.get("/medical-product/client/:client_id/medical-products", medicalProductController.getAllProducts);
    productRoute.get("/medical-product/client/:client_id/medical-products/:id", medicalProductController.getProductById);
    productRoute.put("/medical-product/client/:client_id/medical-products/:id", medicalProductController.updateProduct);
    productRoute.delete("/medical-product/client/:client_id/medical-products/:id", medicalProductController.deleteProduct);
  });

  // ─────────────────────────────────────────────
  // MEDICAL STORES  (auth + role required)
  // ─────────────────────────────────────────────
  fastify.register(async (storeRoute) => {
    storeRoute.addHook("preHandler", authMiddleware);
    storeRoute.addHook("preHandler", roleMiddleware(ALLOWED_ROLES));
    storeRoute.post("/medical-store/client/:client_id/medical-stores", medicalStoreController.createStore);
    storeRoute.get("/medical-store/client/:client_id/medical-stores", medicalStoreController.getAllStores);
    storeRoute.get("/medical-store/client/:client_id/medical-stores/:id", medicalStoreController.getStoreById);
    storeRoute.put("/medical-store/client/:client_id/medical-stores/:id", medicalStoreController.updateStore);
    storeRoute.delete("/medical-store/client/:client_id/medical-stores/:id", medicalStoreController.deleteStore);
  });
}
