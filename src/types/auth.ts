export interface Usuario {
  username: string;
  nome: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  nome: string;
  role: string;
}
