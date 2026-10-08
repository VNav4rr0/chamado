import { Usuario, LoginResponse } from '../types/auth';
import { requestApi, setAuthToken } from './api';

let usuarioArmazenado: Usuario | null = null;
const contasLocais: Record<string, { password: string; nome: string }> = {};

export class AuthService {
  public static async register(username: string, password: string, nome: string): Promise<void> {
    const userTrim = username.trim();
    const passTrim = password.trim();
    const nomeTrim = nome.trim() || userTrim;

    try {
      await requestApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: userTrim, password: passTrim, nome: nomeTrim }),
      });
    } catch (e: any) {
      console.warn('Backend indisponível no momento, registrando conta localmente:', e.message);
      contasLocais[userTrim] = { password: passTrim, nome: nomeTrim };
    }
  }

  public static async login(username: string, password: string): Promise<Usuario> {
    const userTrim = username.trim();
    const passTrim = password.trim();

    try {
      // 1. Tenta autenticar na API Spring Boot
      const data = await requestApi<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: userTrim, password: passTrim }),
      });

      setAuthToken(data.token, data.username);
      const user: Usuario = {
        username: data.username,
        nome: data.nome,
        role: data.role,
      };
      usuarioArmazenado = user;
      return user;
    } catch (apiError: any) {
      console.warn('Falha na chamada do backend. Verificando contas cadastradas:', apiError.message);

      // 2. Verifica se é uma conta cadastrada pelo usuário na sessão local
      if (contasLocais[userTrim] && contasLocais[userTrim].password === passTrim) {
        const conta = contasLocais[userTrim];
        const user: Usuario = {
          username: userTrim,
          nome: conta.nome,
          role: 'ROLE_USER',
        };
        setAuthToken('token-' + Date.now(), userTrim);
        usuarioArmazenado = user;
        return user;
      }

      throw new Error(apiError.message || 'Credenciais inválidas! Verifique o usuário e a senha.');
    }
  }

  public static logout(): void {
    setAuthToken(null);
    usuarioArmazenado = null;
  }

  public static getUsuarioLogado(): Usuario | null {
    return usuarioArmazenado;
  }
}
