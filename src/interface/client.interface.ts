import type { Optional } from 'sequelize';

export interface ClientAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  phone_number: string | null;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export type ClientCreationAttributes = Optional<
  ClientAttributes,
  'id' | 'phone_number' | 'status' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export interface SignupDTO {
  name: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  phone_number?: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthClientPayload {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  status: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}
