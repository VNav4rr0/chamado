package com.fatec.chamado.model;

public enum PrioridadeChamado {
    CRITICA(4),
    ALTA(8),
    MEDIA(24),
    BAIXA(72);

    private final int slaHoras;

    PrioridadeChamado(int slaHoras) {
        this.slaHoras = slaHoras;
    }

    public int getSlaHoras() {
        return slaHoras;
    }
}
