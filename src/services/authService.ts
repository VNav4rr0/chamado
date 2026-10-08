import { Usuario, LoginResponse } from '../types/auth';
import { requestApi, setAuthToken } from './api';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

// Tenta recuperar a sessão salva nos cookies
const savedToken = getCookie('auth_token');
const savedUsername = getCookie('auth_username');
const savedRole = getCookie('auth_role');

let usuarioArmazenado: Usuario | null = null;
if (savedToken && savedUsername) {
  usuarioArmazenado = {
    username: savedUsername,
    nome: getCookie('auth_nome') || savedUsername, // Adicionaremos a gravação de auth_nome depois
    role: savedRole || 'ROLE_USER',
  };
}

const contasLocais: Record<string, { password: string; nome: string; role: string }> = {};

export class AuthService {
  public static async register(username: string, password: string, nome: string, isAdmin: boolean = false): Promise<void> {
    const userTrim = username.trim();
    const passTrim = password.trim();
    const nomeTrim = nome.trim() || userTrim;
    const role = isAdmin ? 'ROLE_ADMIN' : 'ROLE_USER';

    try {
      await requestApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: userTrim, password: passTrim, nome: nomeTrim, admin: isAdmin }),
      });
    } catch (e: any) {
      console.warn('Backend indisponível no momento, registrando conta localmente:', e.message);
      contasLocais[userTrim] = { password: passTrim, nome: nomeTrim, role };
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

      setAuthToken(data.token, data.username, data.role);
      setCookie('auth_nome', data.nome);

      const user: Usuario = {
        username: data.username,
        nome: data.nome,
        role: data.role,
      };
      usuarioArmazenado = user;
      return user;
    } catch (apiError: any) {
      console.warn('Falha na chamada do backend. Verificando contas cadastradas:', apiError.message);

      if (contasLocais[userTrim] && contasLocais[userTrim].password === passTrim) {
        const conta = contasLocais[userTrim];
        const user: Usuario = {
          username: userTrim,
          nome: conta.nome,
          role: conta.role,
        };
        setAuthToken('token-' + Date.now(), userTrim, conta.role);
        setCookie('auth_nome', conta.nome);

        usuarioArmazenado = user;
        return user;
      }

      throw new Error(apiError.message || 'Credenciais inválidas! Verifique o usuário e a senha.');
    }
  }

  public static logout(): void {
    setAuthToken(null, 'admin', 'ROLE_USER');
    deleteCookie('auth_nome');
    usuarioArmazenado = null;
  }

  public static getUsuarioLogado(): Usuario | null {
    return usuarioArmazenado;
  }
}
