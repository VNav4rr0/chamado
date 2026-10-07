package com.fatec.chamado.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "historicos_chamados")
public class HistoricoChamado {

    @Id
    private String id;

    @Column(nullable = false)
    private String chamadoId;

    @Enumerated(EnumType.STRING)
    private StatusChamado statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusChamado statusNovo;

    @Column(nullable = false)
    private String data; // ISO 8601 string

    @Column(length = 1000, nullable = false)
    private String observacao;

    public HistoricoChamado() {}

    public HistoricoChamado(String id, String chamadoId, StatusChamado statusAnterior, StatusChamado statusNovo, String data, String observacao) {
        this.id = id;
        this.chamadoId = chamadoId;
        this.statusAnterior = statusAnterior;
        this.statusNovo = statusNovo;
        this.data = (data != null) ? data : Instant.now().toString();
        this.observacao = observacao;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getChamadoId() {
        return chamadoId;
    }

    public void setChamadoId(String chamadoId) {
        this.chamadoId = chamadoId;
    }

    public StatusChamado getStatusAnterior() {
        return statusAnterior;
    }

    public void setStatusAnterior(StatusChamado statusAnterior) {
        this.statusAnterior = statusAnterior;
    }

    public StatusChamado getStatusNovo() {
        return statusNovo;
    }

    public void setStatusNovo(StatusChamado statusNovo) {
        this.statusNovo = statusNovo;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
