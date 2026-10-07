package com.fatec.mensageria.event;

public class ChamadoResolvidoEvent {
    private String eventId;
    private String chamadoId;
    private String categoria;
    private Long tecnicoId;
    private String timestamp;

    public ChamadoResolvidoEvent() {}

    public ChamadoResolvidoEvent(String eventId, String chamadoId, String categoria, Long tecnicoId, String timestamp) {
        this.eventId = eventId;
        this.chamadoId = chamadoId;
        this.categoria = categoria;
        this.tecnicoId = tecnicoId;
        this.timestamp = timestamp;
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

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
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
