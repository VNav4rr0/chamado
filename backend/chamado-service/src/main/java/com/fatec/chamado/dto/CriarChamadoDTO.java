package com.fatec.chamado.dto;

import com.fatec.chamado.model.CategoriaChamado;
import com.fatec.chamado.model.PrioridadeChamado;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CriarChamadoDTO {

    @NotBlank(message = "Título é obrigatório")
    private String titulo;

    @NotBlank(message = "Descrição é obrigatória")
    private String descricao;

    @NotNull(message = "Categoria é obrigatória")
    private CategoriaChamado categoria;

    @NotNull(message = "Prioridade é obrigatória")
    private PrioridadeChamado prioridade;

    public CriarChamadoDTO() {}

    public CriarChamadoDTO(String titulo, String descricao, CategoriaChamado categoria, PrioridadeChamado prioridade) {
        this.titulo = titulo;
        this.descricao = descricao;
        this.categoria = categoria;
        this.prioridade = prioridade;
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

    public CategoriaChamado getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaChamado categoria) {
        this.categoria = categoria;
    }

    public PrioridadeChamado getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(PrioridadeChamado prioridade) {
        this.prioridade = prioridade;
    }
}
