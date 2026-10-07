package com.fatec.mensageria.service;

import com.fatec.mensageria.dto.AtribuicaoPayloadDTO;
import com.fatec.mensageria.dto.TecnicoDTO;
import com.fatec.mensageria.event.ChamadoCriadoEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AlocacaoFluxoService {

    private static final Logger log = LoggerFactory.getLogger(AlocacaoFluxoService.class);

    private final WebClient webClient;
    private final AtomicLong seqProtocolo = new AtomicLong(105);

    public AlocacaoFluxoService(WebClient.Builder webClientBuilder,
                                @Value("${services.chamado.url:http://localhost:8081}") String chamadoBaseUrl) {
        this.webClient = webClientBuilder.baseUrl(chamadoBaseUrl).build();
    }

    public boolean processarAlocacaoChamado(ChamadoCriadoEvent evento) {
        log.info("⚙️ [Fluxo Assíncrono] Processando alocação do chamado ID: {}, Especialidade: {}",
                evento.getChamadoId(), evento.getCategoria());

        try {
            // 1. Consulta técnicos disponíveis da especialidade no chamado-service
            List<TecnicoDTO> tecnicos = webClient.get()
                    .uri("/tecnicos/especialidade/{especialidade}", evento.getCategoria())
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<TecnicoDTO>>() {})
                    .block();

            if (tecnicos == null || tecnicos.isEmpty()) {
                log.warn("Nenhum técnico cadastrado para a especialidade {}", evento.getCategoria());
                represarChamado(evento.getChamadoId(), evento.getCategoria());
                return false;
            }

            // 2. Filtra os que tem carga disponível e ordena por menor cargaAtual
            TecnicoDTO selecionado = tecnicos.stream()
                    .filter(t -> t.isAtivo() && t.getCargaAtual() < t.getCapacidadeMax())
                    .min(Comparator.comparingInt(TecnicoDTO::getCargaAtual))
                    .orElse(null);

            if (selecionado != null) {
                // Alocação bem-sucedida!
                int novaCarga = selecionado.getCargaAtual() + 1;
                int horasSla = obterHorasSla(evento.getPrioridade());
                String prazoSla = Instant.now().plus(horasSla, ChronoUnit.HOURS).toString();
                String protocolo = String.format("CH-2026-%06d", seqProtocolo.incrementAndGet());

                String observacao = String.format(
                        "Evento ChamadoAtribuidoEvent consumido: Técnico %s alocado (Carga: %d/%d). Protocolo %s gerado. SLA de %dh estabelecido.",
                        selecionado.getNome(), novaCarga, selecionado.getCapacidadeMax(), protocolo, horasSla
                );

                AtribuicaoPayloadDTO payload = new AtribuicaoPayloadDTO(
                        "EM_ATENDIMENTO",
                        protocolo,
                        selecionado.getId(),
                        selecionado.getNome(),
                        prazoSla,
                        observacao
                );

                webClient.put()
                        .uri("/chamados/{id}/atribuicao", evento.getChamadoId())
                        .bodyValue(payload)
                        .retrieve()
                        .toBodilessEntity()
                        .block();

                log.info("✅ Chamado {} alocado com sucesso ao técnico {}", evento.getChamadoId(), selecionado.getNome());
                return true;
            } else {
                // Capacidade esgotada para a especialidade
                log.warn("⚠️ Capacidade esgotada para técnicos de {}. Represando chamado {}...",
                        evento.getCategoria(), evento.getChamadoId());
                represarChamado(evento.getChamadoId(), evento.getCategoria());
                return false;
            }

        } catch (Exception ex) {
            log.error("Erro ao alocar técnico para chamado {}: {}", evento.getChamadoId(), ex.getMessage());
            return false;
        }
    }

    private void represarChamado(String chamadoId, String categoria) {
        String observacao = String.format(
                "Evento AtribuicaoFalhouEvent: Todos os técnicos da especialidade %s atingiram a capacidade máxima. Chamado represado na fila de espera.",
                categoria
        );

        AtribuicaoPayloadDTO payload = new AtribuicaoPayloadDTO(
                "AGUARDANDO_TECNICO",
                null,
                null,
                null,
                null,
                observacao
        );

        try {
            webClient.put()
                    .uri("/chamados/{id}/atribuicao", chamadoId)
                    .bodyValue(payload)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            log.error("Erro ao represar chamado {}: {}", chamadoId, e.getMessage());
        }
    }

    private int obterHorasSla(String prioridade) {
        if (prioridade == null) return 24;
        switch (prioridade.toUpperCase()) {
            case "CRITICA": return 4;
            case "ALTA": return 8;
            case "MEDIA": return 24;
            case "BAIXA": return 72;
            default: return 24;
        }
    }
}
