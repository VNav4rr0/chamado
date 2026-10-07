package com.fatec.chamado.dto;

import com.fatec.chamado.model.StatusChamado;

public class ChamadoCriadoResponse {
    private String id;
    private StatusChamado status;
    private String mensagem;

    public ChamadoCriadoResponse() {}

    public ChamadoCriadoResponse(String id, StatusChamado status, String mensagem) {
        this.id = id;
        this.status = status;
        this.mensagem = mensagem;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public StatusChamado getStatus() {
        return status;
    }

    public void setStatus(StatusChamado status) {
        this.status = status;
    }

    public String getMensagem() {
        return mensagem;
    }

    public void setMensagem(String mensagem) {
        this.mensagem = mensagem;
    }
}
