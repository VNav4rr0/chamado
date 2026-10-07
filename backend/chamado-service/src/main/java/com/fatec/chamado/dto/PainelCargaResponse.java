package com.fatec.chamado.dto;

import com.fatec.chamado.model.Tecnico;

import java.util.List;

public class PainelCargaResponse {
    private List<Tecnico> tecnicos;
    private int totalCarga;
    private int totalCapacidade;
    private int percentualGeral;

    public PainelCargaResponse() {}

    public PainelCargaResponse(List<Tecnico> tecnicos, int totalCarga, int totalCapacidade, int percentualGeral) {
        this.tecnicos = tecnicos;
        this.totalCarga = totalCarga;
        this.totalCapacidade = totalCapacidade;
        this.percentualGeral = percentualGeral;
    }

    public List<Tecnico> getTecnicos() {
        return tecnicos;
    }

    public void setTecnicos(List<Tecnico> tecnicos) {
        this.tecnicos = tecnicos;
    }

    public int getTotalCarga() {
        return totalCarga;
    }

    public void setTotalCarga(int totalCarga) {
        this.totalCarga = totalCarga;
    }

    public int getTotalCapacidade() {
        return totalCapacidade;
    }

    public void setTotalCapacidade(int totalCapacidade) {
        this.totalCapacidade = totalCapacidade;
    }

    public int getPercentualGeral() {
        return percentualGeral;
    }

    public void setPercentualGeral(int percentualGeral) {
        this.percentualGeral = percentualGeral;
    }
}
