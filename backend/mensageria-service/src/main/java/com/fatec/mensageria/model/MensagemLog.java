package com.fatec.mensageria.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensagens_log")
public class MensagemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventId;

    @Column(nullable = false)
    private String tipoEvento; // ChamadoCriadoEvent, ChamadoResolvidoEvent, etc.

    @Column(nullable = false)
    private String chamadoId;

    @Column(length = 2000)
    private String payloadJson;

    @Column(nullable = false)
    private String statusProcessamento; // RECEBIDO, EM_PROCESSAMENTO, PROCESSADO_SUCESSO, REPRESADO, ERRO

    private String threadExecutor;

    private Long tempoExecucaoMs;

    @Column(length = 1000)
    private String detalhes;

    @Column(nullable = false)
    private LocalDateTime dataHora;

    public MensagemLog() {
        this.dataHora = LocalDateTime.now();
    }

    public MensagemLog(String eventId, String tipoEvento, String chamadoId, String payloadJson, String statusProcessamento) {
        this.eventId = eventId;
        this.tipoEvento = tipoEvento;
        this.chamadoId = chamadoId;
        this.payloadJson = payloadJson;
        this.statusProcessamento = statusProcessamento;
        this.dataHora = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(String tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public String getChamadoId() {
        return chamadoId;
    }

    public void setChamadoId(String chamadoId) {
        this.chamadoId = chamadoId;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public String getStatusProcessamento() {
        return statusProcessamento;
    }

    public void setStatusProcessamento(String statusProcessamento) {
        this.statusProcessamento = statusProcessamento;
    }

    public String getThreadExecutor() {
        return threadExecutor;
    }

    public void setThreadExecutor(String threadExecutor) {
        this.threadExecutor = threadExecutor;
    }

    public Long getTempoExecucaoMs() {
        return tempoExecucaoMs;
    }

    public void setTempoExecucaoMs(Long tempoExecucaoMs) {
        this.tempoExecucaoMs = tempoExecucaoMs;
    }

    public String getDetalhes() {
        return detalhes;
    }

    public void setDetalhes(String detalhes) {
        this.detalhes = detalhes;
    }

    public LocalDateTime getDataHora() {
        return dataHora;
    }

    public void setDataHora(LocalDateTime dataHora) {
        this.dataHora = dataHora;
    }
}
