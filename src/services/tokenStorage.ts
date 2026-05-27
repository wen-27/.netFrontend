const tokenKey = "auto_taller_manager_token";
const roleKey = "auto_taller_manager_role";
const emailKey = "auto_taller_manager_email";

export const tokenStorage = {
  getToken() {
    return localStorage.getItem(tokenKey);
  },
  setToken(token: string) {
    localStorage.setItem(tokenKey, token);
  },
  getRole() {
    return localStorage.getItem(roleKey);
  },
  setRole(role: string) {
    localStorage.setItem(roleKey, role);
  },
  getEmail() {
    return localStorage.getItem(emailKey);
  },
  setEmail(email: string) {
    localStorage.setItem(emailKey, email);
  },
  clearToken() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(roleKey);
    localStorage.removeItem(emailKey);
  },
};
