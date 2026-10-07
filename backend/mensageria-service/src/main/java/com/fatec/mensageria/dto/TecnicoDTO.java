package com.fatec.mensageria.dto;

public class TecnicoDTO {
    private Long id;
    private String nome;
    private String especialidade;
    private int cargaAtual;
    private int capacidadeMax;
    private boolean ativo;

    public TecnicoDTO() {}

    public TecnicoDTO(Long id, String nome, String especialidade, int cargaAtual, int capacidadeMax, boolean ativo) {
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

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public int getCargaAtual() {
        return cargaAtual;
    }

    public void setCargaAtual(int cargaAtual) {
        this.cargaAtual = cargaAtual;
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
}
