package com.fatec.chamado.event;

import com.fatec.chamado.model.CategoriaChamado;

import java.time.Instant;

public class ChamadoResolvidoEvent {
    private String eventId;
    private String chamadoId;
    private CategoriaChamado categoria;
    private Long tecnicoId;
    private String timestamp;

    public ChamadoResolvidoEvent() {
        this.timestamp = Instant.now().toString();
    }

    public ChamadoResolvidoEvent(String eventId, String chamadoId, CategoriaChamado categoria, Long tecnicoId) {
        this.eventId = eventId;
        this.chamadoId = chamadoId;
        this.categoria = categoria;
        this.tecnicoId = tecnicoId;
        this.timestamp = Instant.now().toString();
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getChamadoId() {
        return chamadoId;
    }

    public void setChamadoId(String chamadoId) {
        this.chamadoId = chamadoId;
    }

    public CategoriaChamado getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaChamado categoria) {
        this.categoria = categoria;
    }

    public Long getTecnicoId() {
        return tecnicoId;
    }

    public void setTecnicoId(Long tecnicoId) {
        this.tecnicoId = tecnicoId;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
