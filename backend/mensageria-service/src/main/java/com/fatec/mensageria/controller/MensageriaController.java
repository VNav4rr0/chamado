package com.fatec.mensageria.controller;

import com.fatec.mensageria.dto.MetricasMensageriaDTO;
import com.fatec.mensageria.event.ChamadoCriadoEvent;
import com.fatec.mensageria.event.ChamadoResolvidoEvent;
import com.fatec.mensageria.model.MensagemLog;
import com.fatec.mensageria.repository.MensagemLogRepository;
import com.fatec.mensageria.service.MensageriaQueueProcessor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mensageria")
@CrossOrigin(origins = "*")
public class MensageriaController {

    private final MensageriaQueueProcessor queueProcessor;
    private final MensagemLogRepository logRepository;
    private final ThreadPoolTaskExecutor taskExecutor;

    public MensageriaController(MensageriaQueueProcessor queueProcessor,
                                MensagemLogRepository logRepository,
                                @Qualifier("mensageriaTaskExecutor") ThreadPoolTaskExecutor taskExecutor) {
        this.queueProcessor = queueProcessor;
        this.logRepository = logRepository;
        this.taskExecutor = taskExecutor;
    }

    @PostMapping("/eventos/chamado-criado")
    public ResponseEntity<?> receberEventoChamadoCriado(@RequestBody ChamadoCriadoEvent event) {
        queueProcessor.processarEventoCriacao(event);
        return ResponseEntity.accepted().body(Map.of(
                "status", "ENFILEIRADO",
                "mensagem", "Evento recebido pelo broker e despachado para worker concorrente."
        ));
    }

    @PostMapping("/eventos/chamado-resolvido")
    public ResponseEntity<?> receberEventoChamadoResolvido(@RequestBody ChamadoResolvidoEvent event) {
        queueProcessor.processarEventoResolucao(event);
        return ResponseEntity.accepted().body(Map.of(
                "status", "ENFILEIRADO",
                "mensagem", "Evento de resolução enfileirado."
        ));
    }

    @GetMapping("/metricas")
    public ResponseEntity<MetricasMensageriaDTO> obterMetricas() {
        int threadsAtivas = taskExecutor.getActiveCount();
        int capacidadeFila = taskExecutor.getThreadPoolExecutor().getQueue().remainingCapacity();

        MetricasMensageriaDTO metricas = new MetricasMensageriaDTO(
                queueProcessor.getTotalRecebidos(),
                queueProcessor.getTotalAlocados(),
                queueProcessor.getTotalRepresados(),
                queueProcessor.getTotalResolvidos(),
                threadsAtivas,
                capacidadeFila
        );

        return ResponseEntity.ok(metricas);
    }

    @GetMapping("/logs")
    public ResponseEntity<List<MensagemLog>> obterLogsAuditoria() {
        return ResponseEntity.ok(logRepository.findTop50ByOrderByDataHoraDesc());
    }
}
