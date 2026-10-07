package com.fatec.chamado.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tecnicos")
public class Tecnico {

    @Id
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaChamado especialidade;

    @Column(nullable = false)
    private int cargaAtual;

    @Column(nullable = false)
    private int capacidadeMax;

    @Column(nullable = false)
    private boolean ativo;

    private String avatar;

    public Tecnico() {}

    public Tecnico(Long id, String nome, CategoriaChamado especialidade, int cargaAtual, int capacidadeMax, boolean ativo) {
        this.id = id;
        this.nome = nome;
        this.especialidade = especialidade;
        this.cargaAtual = cargaAtual;
        this.capacidadeMax = capacidadeMax;
        this.ativo = ativo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public CategoriaChamado getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(CategoriaChamado especialidade) {
        this.especialidade = especialidade;
    }

    public int getCargaAtual() {
        return cargaAtual;
    }

    public void setCargaAtual(int cargaAtual) {
        this.cargaAtual = Math.max(0, cargaAtual);
    }

    public int getCapacidadeMax() {
        return capacidadeMax;
    }

    public void setCapacidadeMax(int capacidadeMax) {
        this.capacidadeMax = capacidadeMax;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
