package com.fatec.mensageria.dto;

import java.util.ArrayList;
import java.util.List;

public class MultiRequestResultadoDTO {
    private int totalDisparados;
    private int totalSucesso;
    private int totalFalhas;
    private long tempoTotalMs;
    private double tempoMedioPorRequisicaoMs;
    private double throughputRps;
    private List<String> logsResumo = new ArrayList<>();

    public MultiRequestResultadoDTO() {}

    public int getTotalDisparados() {
        return totalDisparados;
    }

    public void setTotalDisparados(int totalDisparados) {
        this.totalDisparados = totalDisparados;
    }

    public int getTotalSucesso() {
        return totalSucesso;
    }

    public void setTotalSucesso(int totalSucesso) {
        this.totalSucesso = totalSucesso;
    }

    public int getTotalFalhas() {
        return totalFalhas;
    }

    public void setTotalFalhas(int totalFalhas) {
        this.totalFalhas = totalFalhas;
    }

    public long getTempoTotalMs() {
        return tempoTotalMs;
    }

    public void setTempoTotalMs(long tempoTotalMs) {
        this.tempoTotalMs = tempoTotalMs;
    }

    public double getTempoMedioPorRequisicaoMs() {
        return tempoMedioPorRequisicaoMs;
    }

    public void setTempoMedioPorRequisicaoMs(double tempoMedioPorRequisicaoMs) {
        this.tempoMedioPorRequisicaoMs = tempoMedioPorRequisicaoMs;
    }

    public double getThroughputRps() {
        return throughputRps;
    }

    public void setThroughputRps(double throughputRps) {
        this.throughputRps = throughputRps;
    }

    public List<String> getLogsResumo() {
        return logsResumo;
    }

    public void setLogsResumo(List<String> logsResumo) {
        this.logsResumo = logsResumo;
    }

    public void adicionarLog(String log) {
        this.logsResumo.add(log);
    }
}
