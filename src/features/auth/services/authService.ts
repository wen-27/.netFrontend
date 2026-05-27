import { apiClient } from "../../../services/apiClient";
import { LoginRequest, LoginResponse, RegisterClientRequest } from "../types/auth.types";

export const authService = {
  async login(payload: LoginRequest) {
    const { data } = await apiClient.post<LoginResponse>("/api/auth/login", payload);
    return data;
  },
  async registerClient(payload: RegisterClientRequest) {
    const { data } = await apiClient.post<LoginResponse | unknown>("/api/auth/register-client", payload);
    return data;
  },
};
