package com.fatec.chamado.dto;

public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private String username;
    private String nome;
    private String role;

    public LoginResponse() {}

    public LoginResponse(String token, String username, String nome, String role) {
        this.token = token;
        this.type = "Bearer";
        this.username = username;
        this.nome = nome;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
