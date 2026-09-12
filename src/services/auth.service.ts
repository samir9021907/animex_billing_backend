import UserModel from "../models/user.model";
import ClientModel from "../models/client.model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthService {
  async signup(data: any) {
    const { name, email, phone, address, city } = data;

    if (!name) {
      throw new Error("Name is required");
    }

    const client = await ClientModel.create({
      name,
      email: email ?? null,
      phone: phone ?? null,
      address: address ?? null,
      city: city ?? null,
      status: "active"
    });

    const token = jwt.sign(
      {
        id: client.id,
        name: client.name,
        email: client.email ?? "",
        role: "businessowner"   // default role for newly signed-up clients
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    return {
      message: "Client registered successfully",
      token,
      client
    };
  }

  async login(data: any) {
    const { email, phone, password } = data;

    if (!password) {
      throw new Error("Password is required");
    }

    const whereCondition: any = {};
    if (email) whereCondition.email = email;
    if (phone) whereCondition.phone = phone;

    const user = await UserModel.findOne({ where: whereCondition });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.password) {
      throw new Error("Invalid credentials");
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email ?? "",
        role: user.role           // ← include role so roleMiddleware works
      },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1d" }
    );

    return {
      message: "Login successful",
      token,
      user
    };
  }
}
