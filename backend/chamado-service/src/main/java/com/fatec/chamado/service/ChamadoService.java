package com.fatec.chamado.service;

import com.fatec.chamado.dto.AtualizacaoAtribuicaoDTO;
import com.fatec.chamado.dto.ChamadoCriadoResponse;
import com.fatec.chamado.dto.CriarChamadoDTO;
import com.fatec.chamado.event.ChamadoCriadoEvent;
import com.fatec.chamado.event.ChamadoEventPublisher;
import com.fatec.chamado.event.ChamadoResolvidoEvent;
import com.fatec.chamado.model.*;
import com.fatec.chamado.repository.ChamadoRepository;
import com.fatec.chamado.repository.HistoricoChamadoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final HistoricoChamadoRepository historicoChamadoRepository;
    private final TecnicoService tecnicoService;
    private final ChamadoEventPublisher eventPublisher;

    public ChamadoService(ChamadoRepository chamadoRepository,
                          HistoricoChamadoRepository historicoChamadoRepository,
                          TecnicoService tecnicoService,
                          ChamadoEventPublisher eventPublisher) {
        this.chamadoRepository = chamadoRepository;
        this.historicoChamadoRepository = historicoChamadoRepository;
        this.tecnicoService = tecnicoService;
        this.eventPublisher = eventPublisher;
    }

    public List<Chamado> listar(String usuarioId) {
        if (usuarioId != null && !usuarioId.trim().isEmpty()) {
            return chamadoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId.trim());
        }
        return chamadoRepository.findAllByOrderByCriadoEmDesc();
    }

    public Optional<Chamado> buscarPorId(String id) {
        return chamadoRepository.findById(id);
    }

    @Transactional
    public ChamadoCriadoResponse criarChamado(CriarChamadoDTO dto, String usuarioId) {
        String uid = (usuarioId != null && !usuarioId.isBlank()) ? usuarioId : "user-fatec-1";
        String chamadoId = "c-" + Long.toString(System.currentTimeMillis(), 36);
        String agora = Instant.now().toString();

        Chamado chamado = new Chamado(
                chamadoId,
                uid,
                dto.getTitulo().trim(),
                dto.getDescricao().trim(),
                dto.getCategoria(),
                dto.getPrioridade()
        );

        HistoricoChamado historicoInicial = new HistoricoChamado(
                "h-" + System.currentTimeMillis() + "-1",
                chamadoId,
                null,
                StatusChamado.ABERTO,
                agora,
                "Chamado gravado com sucesso. Evento ChamadoAbertoEvent enfileirado no Outbox Transactional."
        );
        chamado.adicionarHistorico(historicoInicial);

        chamadoRepository.save(chamado);

        // Dispara evento assíncrono para o mensageria-service
        ChamadoCriadoEvent event = new ChamadoCriadoEvent(
                UUID.randomUUID().toString(),
                chamadoId,
                uid,
                dto.getTitulo(),
                dto.getCategoria(),
                dto.getPrioridade()
        );
        eventPublisher.publicarChamadoCriado(event);

        return new ChamadoCriadoResponse(
                chamadoId,
                StatusChamado.ABERTO,
                "Chamado recebido e aceito para processamento assíncrono (HTTP 202 Accepted)."
        );
    }

    @Transactional
    public Chamado resolverChamado(String id) {
        Chamado chamado = chamadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado: " + id));

        if (chamado.getStatus() == StatusChamado.RESOLVIDO) {
            return chamado;
        }

        StatusChamado statusAnterior = chamado.getStatus();
        chamado.setStatus(StatusChamado.RESOLVIDO);

        // Se havia técnico atribuído, desocupa carga (-1)
        if (chamado.getTecnicoId() != null) {
            tecnicoService.decrementarCarga(chamado.getTecnicoId());
        }

        HistoricoChamado histResolvido = new HistoricoChamado(
                "h-" + System.currentTimeMillis() + "-res",
                chamado.getId(),
                statusAnterior,
                StatusChamado.RESOLVIDO,
                Instant.now().toString(),
                "Chamado finalizado pelo operador. Evento ChamadoResolvidoEvent gerado. Carga do técnico liberada."
        );
        chamado.adicionarHistorico(histResolvido);

        Chamado salvo = chamadoRepository.save(chamado);

        // Publica evento para acionar desrepresamento
        ChamadoResolvidoEvent event = new ChamadoResolvidoEvent(
                UUID.randomUUID().toString(),
                chamado.getId(),
                chamado.getCategoria(),
                chamado.getTecnicoId()
        );
        eventPublisher.publicarChamadoResolvido(event);

        return salvo;
    }

    @Transactional
    public Chamado atualizarAtribuicao(String id, AtualizacaoAtribuicaoDTO dto) {
        Chamado chamado = chamadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chamado não encontrado para atribuição: " + id));

        StatusChamado anterior = chamado.getStatus();
        chamado.setStatus(dto.getStatus());

        if (dto.getProtocolo() != null) {
            chamado.setProtocolo(dto.getProtocolo());
        }
        if (dto.getTecnicoId() != null) {
            chamado.setTecnicoId(dto.getTecnicoId());
            chamado.setTecnicoNome(dto.getTecnicoNome());
            // Atualiza carga do técnico
            tecnicoService.incrementarCarga(dto.getTecnicoId());
        }
        if (dto.getSlaPrazo() != null) {
            chamado.setSlaPrazo(dto.getSlaPrazo());
        }

        HistoricoChamado hist = new HistoricoChamado(
                "h-" + System.currentTimeMillis() + "-atrib",
                chamado.getId(),
                anterior,
                dto.getStatus(),
                Instant.now().toString(),
                dto.getObservacao()
        );
        chamado.adicionarHistorico(hist);

        return chamadoRepository.save(chamado);
    }
}
