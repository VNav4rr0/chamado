package com.fatec.mensageria.service;

import com.fatec.mensageria.event.ChamadoCriadoEvent;
import com.fatec.mensageria.event.ChamadoResolvidoEvent;
import com.fatec.mensageria.model.MensagemLog;
import com.fatec.mensageria.repository.MensagemLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class MensageriaQueueProcessor {

    private static final Logger log = LoggerFactory.getLogger(MensageriaQueueProcessor.class);

    private final AlocacaoFluxoService alocacaoFluxoService;
    private final MensagemLogRepository mensagemLogRepository;

    @Value("${concorrencia.simulacao-delay-ms:1800}")
    private long simulacaoDelayMs;

    private final AtomicLong totalRecebidos = new AtomicLong(0);
    private final AtomicLong totalAlocados = new AtomicLong(0);
    private final AtomicLong totalRepresados = new AtomicLong(0);
    private final AtomicLong totalResolvidos = new AtomicLong(0);

    public MensageriaQueueProcessor(AlocacaoFluxoService alocacaoFluxoService,
                                    MensagemLogRepository mensagemLogRepository) {
        this.alocacaoFluxoService = alocacaoFluxoService;
        this.mensagemLogRepository = mensagemLogRepository;
    }

    @Async("mensageriaTaskExecutor")
    public void processarEventoCriacao(ChamadoCriadoEvent event) {
        long inicio = System.currentTimeMillis();
        String threadName = Thread.currentThread().getName();
        totalRecebidos.incrementAndGet();

        log.info("📥 [{}] Mensagem recebida na fila: ChamadoAbertoEvent [id={}]", threadName, event.getChamadoId());

        MensagemLog logRegistro = new MensagemLog(
                event.getEventId(),
                "ChamadoCriadoEvent",
                event.getChamadoId(),
                String.format("{\"categoria\":\"%s\",\"prioridade\":\"%s\"}", event.getCategoria(), event.getPrioridade()),
                "EM_PROCESSAMENTO"
        );
        logRegistro.setThreadExecutor(threadName);
        mensagemLogRepository.save(logRegistro);

        try {
            // Simulação de latência de fila assíncrona / broker
            if (simulacaoDelayMs > 0) {
                Thread.sleep(simulacaoDelayMs);
            }

            boolean sucessoAlocacao = alocacaoFluxoService.processarAlocacaoChamado(event);
            long tempoTotal = System.currentTimeMillis() - inicio;

            if (sucessoAlocacao) {
                totalAlocados.incrementAndGet();
                logRegistro.setStatusProcessamento("PROCESSADO_SUCESSO");
                logRegistro.setDetalhes("Técnico alocado com sucesso via fila concorrente.");
            } else {
                totalRepresados.incrementAndGet();
                logRegistro.setStatusProcessamento("REPRESADO");
                logRegistro.setDetalhes("Capacidade esgotada. Movido para AGUARDANDO_TECNICO.");
            }

            logRegistro.setTempoExecucaoMs(tempoTotal);
            mensagemLogRepository.save(logRegistro);

        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            log.error("Thread interrompida durante processamento da mensagem: {}", ie.getMessage());
        } catch (Exception e) {
            log.error("Erro ao processar evento na fila: {}", e.getMessage());
            logRegistro.setStatusProcessamento("ERRO");
            logRegistro.setDetalhes("Erro: " + e.getMessage());
            logRegistro.setTempoExecucaoMs(System.currentTimeMillis() - inicio);
            mensagemLogRepository.save(logRegistro);
        }
    }

    @Async("mensageriaTaskExecutor")
    public void processarEventoResolucao(ChamadoResolvidoEvent event) {
        long inicio = System.currentTimeMillis();
        String threadName = Thread.currentThread().getName();
        totalResolvidos.incrementAndGet();

        log.info("📥 [{}] Mensagem recebida na fila: ChamadoResolvidoEvent [id={}, tecnico={}]",
                threadName, event.getChamadoId(), event.getTecnicoId());

        MensagemLog logRegistro = new MensagemLog(
                event.getEventId(),
                "ChamadoResolvidoEvent",
                event.getChamadoId(),
                String.format("{\"categoria\":\"%s\",\"tecnicoId\":%d}", event.getCategoria(), event.getTecnicoId()),
                "PROCESSADO_SUCESSO"
        );
        logRegistro.setThreadExecutor(threadName);
        logRegistro.setDetalhes("Resolução confirmada. Carga liberada.");
        logRegistro.setTempoExecucaoMs(System.currentTimeMillis() - inicio);
        mensagemLogRepository.save(logRegistro);
    }

    public long getTotalRecebidos() {
        return totalRecebidos.get();
    }

    public long getTotalAlocados() {
        return totalAlocados.get();
    }

    public long getTotalRepresados() {
        return totalRepresados.get();
    }

    public long getTotalResolvidos() {
        return totalResolvidos.get();
    }
}
