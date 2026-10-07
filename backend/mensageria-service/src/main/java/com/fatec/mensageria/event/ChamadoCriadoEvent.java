package com.fatec.mensageria.event;

public class ChamadoCriadoEvent {
    private String eventId;
    private String chamadoId;
    private String usuarioId;
    private String titulo;
    private String categoria;
    private String prioridade;
    private String timestamp;

    public ChamadoCriadoEvent() {}

    public ChamadoCriadoEvent(String eventId, String chamadoId, String usuarioId, String titulo, String categoria, String prioridade, String timestamp) {
        this.eventId = eventId;
        this.chamadoId = chamadoId;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.categoria = categoria;
        this.prioridade = prioridade;
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

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public String getPrioridade() {
        return prioridade;
    }

    public void setPrioridade(String prioridade) {
        this.prioridade = prioridade;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
