package com.fatec.chamado.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "chamados")
public class Chamado {

    @Id
    private String id;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000, nullable = false)
    private String descricao;

    @Column(nullable = false)
    private String status; // ABERTO, EM_PROCESSAMENTO, CONCLUIDO

    @Column(nullable = false)
    private String usuarioId;

    @Column(nullable = false)
    private String criadoEm;

    public Chamado() {
        this.criadoEm = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
        this.status = "ABERTO";
    }

    public Chamado(String id, String titulo, String descricao, String usuarioId) {
        this.id = id;
        this.titulo = titulo;
        this.descricao = descricao;
        this.usuarioId = usuarioId;
        this.status = "ABERTO";
        this.criadoEm = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(String criadoEm) {
        this.criadoEm = criadoEm;
    }
}
