import api from "./api";
import Cookies from "js-cookie";
import { AuthDTO, AuthResponse, User, ApiError } from "./types";

class AuthService {
  private readonly TOKEN_KEY = "auth_token";
  private readonly USER_KEY = "user_data";

  // Fazer login
  async login(credentials: AuthDTO): Promise<AuthResponse> {
    try {
      const response = await api.post("/auth/login", credentials);

      // Assumindo que o backend retorna um token JWT
      const token = response.data;

      // Salvar token nos cookies
      Cookies.set(this.TOKEN_KEY, token, { expires: 7 }); // 7 dias

      // Decodificar o token para obter dados do usuário (simplificado)
      const userData = this.parseJwt(token);
      Cookies.set(this.USER_KEY, JSON.stringify(userData), { expires: 7 });

      return {
        token,
        user: userData,
      };
    } catch (error: any) {
      // O error já foi processado pelo interceptor da API
      throw error;
    }
  }

  // Fazer registro
  async register(userData: AuthDTO): Promise<string> {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      // O error já foi processado pelo interceptor da API
      throw error;
    }
  }

  // Fazer logout
  logout(): void {
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.USER_KEY);

    // Evitar redirecionamento em loop se já estiver na página de login
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  // Limpar tokens sem redirecionar (para limpeza silenciosa)
  clearTokens(): void {
    Cookies.remove(this.TOKEN_KEY);
    Cookies.remove(this.USER_KEY);
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const token = Cookies.get(this.TOKEN_KEY);
    if (!token) return false;

    // Verificar se o token não expirou
    try {
      const payload = this.parseJwt(token);
      const currentTime = Date.now() / 1000;

      if (payload.exp <= currentTime) {
        // Token expirado - limpar automaticamente (sem redirecionamento)
        this.clearTokens();
        return false;
      }

      return true;
    } catch {
      // Token inválido - limpar automaticamente (sem redirecionamento)
      this.clearTokens();
      return false;
    }
  }

  // Obter token
  getToken(): string | undefined {
    return Cookies.get(this.TOKEN_KEY);
  }

  // Obter dados do usuário
  getCurrentUser(): User | null {
    try {
      const userData = Cookies.get(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Verificar se é admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === "ADMIN";
  }

  // Função auxiliar para decodificar JWT (simplificada)
  private parseJwt(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error("Token inválido");
    }
  }
}

export default new AuthService();
