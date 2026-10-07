package com.fatec.mensageria.dto;

public class MultiRequestConfigDTO {
    private int quantidade = 10;
    private int concorrencia = 4;
    private String categoria = "REDE"; // REDE, HARDWARE, SOFTWARE, ACESSO ou MISTO
    private String prioridade = "ALTA"; // CRITICA, ALTA, MEDIA, BAIXA ou MISTO

    public MultiRequestConfigDTO() {}

    public MultiRequestConfigDTO(int quantidade, int concorrencia, String categoria, String prioridade) {
        this.quantidade = quantidade;
        this.concorrencia = concorrencia;
        this.categoria = categoria;
        this.prioridade = prioridade;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = Math.max(1, Math.min(200, quantidade));
    }

    public int getConcorrencia() {
        return concorrencia;
    }

    public void setConcorrencia(int concorrencia) {
        this.concorrencia = Math.max(1, Math.min(32, concorrencia));
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
}
