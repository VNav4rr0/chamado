package com.fatec.chamado.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chamados")
public class Chamado {

    @Id
    private String id;

    @Column(nullable = false)
    private String usuarioId;

    @Column(nullable = false)
    private String titulo;

    @Column(length = 2000, nullable = false)
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaChamado categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrioridadeChamado prioridade;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusChamado status;

    private String protocolo;

    private Long tecnicoId;

    private String tecnicoNome;

    private String slaPrazo;

    @Column(nullable = false)
    private String criadoEm;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "chamadoId")
    @OrderBy("data ASC")
    private List<HistoricoChamado> historico = new ArrayList<>();

    public Chamado() {
        this.criadoEm = Instant.now().toString();
        this.status = StatusChamado.ABERTO;
    }

    public Chamado(String id, String usuarioId, String titulo, String descricao,
                   CategoriaChamado categoria, PrioridadeChamado prioridade) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.descricao = descricao;
        this.categoria = categoria;
        this.prioridade = prioridade;
        this.status = StatusChamado.ABERTO;
        this.criadoEm = Instant.now().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId) {
        this.usuarioId = usuarioId;
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

    public StatusChamado getStatus() {
        return status;
    }

    public void setStatus(StatusChamado status) {
        this.status = status;
    }

    public String getProtocolo() {
        return protocolo;
    }

    public void setProtocolo(String protocolo) {
        this.protocolo = protocolo;
    }

    public Long getTecnicoId() {
        return tecnicoId;
    }

    public void setTecnicoId(Long tecnicoId) {
        this.tecnicoId = tecnicoId;
    }

    public String getTecnicoNome() {
        return tecnicoNome;
    }

    public void setTecnicoNome(String tecnicoNome) {
        this.tecnicoNome = tecnicoNome;
    }

    public String getSlaPrazo() {
        return slaPrazo;
    }

    public void setSlaPrazo(String slaPrazo) {
        this.slaPrazo = slaPrazo;
    }

    public String getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(String criadoEm) {
        this.criadoEm = criadoEm;
    }

    public List<HistoricoChamado> getHistorico() {
        return historico;
    }

    public void setHistorico(List<HistoricoChamado> historico) {
        this.historico = historico;
    }

    public void adicionarHistorico(HistoricoChamado item) {
        if (this.historico == null) {
            this.historico = new ArrayList<>();
        }
        this.historico.add(item);
    }
}
