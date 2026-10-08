package com.fatec.chamado.dto;

import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {

    @NotBlank(message = "Username é obrigatório")
    private String username;

    @NotBlank(message = "Senha é obrigatória")
    private String password;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    public RegisterRequest() {}

    public RegisterRequest(String username, String password, String nome) {
        this.username = username;
        this.password = password;
        this.nome = nome;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }
}
