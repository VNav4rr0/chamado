package com.fatec.mensageria.dto;

public class MetricasMensageriaDTO {
    private long totalEventosRecebidos;
    private long totalAlocadosComSucesso;
    private long totalRepresadosFilaEspera;
    private long totalResolvidosProcessados;
    private int poolThreadsAtivas;
    private int poolCapacidadeRestanteFila;

    public MetricasMensageriaDTO() {}

    public MetricasMensageriaDTO(long totalEventosRecebidos, long totalAlocadosComSucesso,
                                 long totalRepresadosFilaEspera, long totalResolvidosProcessados,
                                 int poolThreadsAtivas, int poolCapacidadeRestanteFila) {
        this.totalEventosRecebidos = totalEventosRecebidos;
        this.totalAlocadosComSucesso = totalAlocadosComSucesso;
        this.totalRepresadosFilaEspera = totalRepresadosFilaEspera;
        this.totalResolvidosProcessados = totalResolvidosProcessados;
        this.poolThreadsAtivas = poolThreadsAtivas;
        this.poolCapacidadeRestanteFila = poolCapacidadeRestanteFila;
    }

    public long getTotalEventosRecebidos() {
        return totalEventosRecebidos;
    }

    public void setTotalEventosRecebidos(long totalEventosRecebidos) {
        this.totalEventosRecebidos = totalEventosRecebidos;
    }

    public long getTotalAlocadosComSucesso() {
        return totalAlocadosComSucesso;
    }

    public void setTotalAlocadosComSucesso(long totalAlocadosComSucesso) {
        this.totalAlocadosComSucesso = totalAlocadosComSucesso;
    }

    public long getTotalRepresadosFilaEspera() {
        return totalRepresadosFilaEspera;
    }

    public void setTotalRepresadosFilaEspera(long totalRepresadosFilaEspera) {
        this.totalRepresadosFilaEspera = totalRepresadosFilaEspera;
    }

    public long getTotalResolvidosProcessados() {
        return totalResolvidosProcessados;
    }

    public void setTotalResolvidosProcessados(long totalResolvidosProcessados) {
        this.totalResolvidosProcessados = totalResolvidosProcessados;
    }

    public int getPoolThreadsAtivas() {
        return poolThreadsAtivas;
    }

    public void setPoolThreadsAtivas(int poolThreadsAtivas) {
        this.poolThreadsAtivas = poolThreadsAtivas;
    }

    public int getPoolCapacidadeRestanteFila() {
        return poolCapacidadeRestanteFila;
    }

    public void setPoolCapacidadeRestanteFila(int poolCapacidadeRestanteFila) {
        this.poolCapacidadeRestanteFila = poolCapacidadeRestanteFila;
    }
}
