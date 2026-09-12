import type { Optional } from 'sequelize';

export interface MedicalStoreAttributes {
  id: string;
  client_id: string;
  firm_name: string;
  contact_person_name: string | null;
  phone_number: string;
  district: string;
  address: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date | null;
}

export type MedicalStoreCreationAttributes = Optional<
  MedicalStoreAttributes,
  'id' | 'contact_person_name' | 'status' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export interface CreateMedicalStoreDTO {
  firm_name: string;
  contact_person_name?: string | null;
  phone_number: string;
  district: string;
  address: string;
  status?: boolean;
}

export interface UpdateMedicalStoreDTO {
  firm_name?: string;
  contact_person_name?: string | null;
  phone_number?: string;
  district?: string;
  address?: string;
  status?: boolean;
}

export interface MedicalStoreQuery {
  page?: number;
  limit?: number;
  district?: string;
  status?: boolean;
}
