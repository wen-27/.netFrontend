import { Role } from "../../../shared/types/common";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  userId: number;
  personId: number;
  email: string;
  role: Role;
  accessToken: string;
  expiresAt: string;
};

export type RegisterClientRequest = {
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  secondLastName: string | null;
  birthDate: string | null;
  genderId: number | null;
  addressId: number | null;
  email: string;
  password: string;
  phoneCountryId: number | null;
  phoneNumber: string | null;
  addressText?: string | null;
};
