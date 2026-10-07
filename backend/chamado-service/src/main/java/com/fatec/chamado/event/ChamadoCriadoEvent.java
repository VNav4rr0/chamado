package com.fatec.chamado.event;

import com.fatec.chamado.model.CategoriaChamado;
import com.fatec.chamado.model.PrioridadeChamado;

import java.time.Instant;

public class ChamadoCriadoEvent {
    private String eventId;
    private String chamadoId;
    private String usuarioId;
    private String titulo;
    private CategoriaChamado categoria;
    private PrioridadeChamado prioridade;
    private String timestamp;

    public ChamadoCriadoEvent() {
        this.timestamp = Instant.now().toString();
    }

    public ChamadoCriadoEvent(String eventId, String chamadoId, String usuarioId, String titulo,
                              CategoriaChamado categoria, PrioridadeChamado prioridade) {
        this.eventId = eventId;
        this.chamadoId = chamadoId;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.categoria = categoria;
        this.prioridade = prioridade;
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

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
