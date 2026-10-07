package com.fatec.chamado.dto;

import com.fatec.chamado.model.StatusChamado;

public class AtualizacaoAtribuicaoDTO {
    private StatusChamado status;
    private String protocolo;
    private Long tecnicoId;
    private String tecnicoNome;
    private String slaPrazo;
    private String observacao;

    public AtualizacaoAtribuicaoDTO() {}

    public AtualizacaoAtribuicaoDTO(StatusChamado status, String protocolo, Long tecnicoId, String tecnicoNome, String slaPrazo, String observacao) {
        this.status = status;
        this.protocolo = protocolo;
        this.tecnicoId = tecnicoId;
        this.tecnicoNome = tecnicoNome;
        this.slaPrazo = slaPrazo;
        this.observacao = observacao;
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

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }
}
