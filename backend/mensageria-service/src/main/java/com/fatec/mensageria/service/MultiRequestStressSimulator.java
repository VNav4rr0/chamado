package com.fatec.mensageria.service;

import com.fatec.mensageria.dto.MultiRequestConfigDTO;
import com.fatec.mensageria.dto.MultiRequestResultadoDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MultiRequestStressSimulator {

    private static final Logger log = LoggerFactory.getLogger(MultiRequestStressSimulator.class);

    private final WebClient webClient;

    public MultiRequestStressSimulator(WebClient.Builder webClientBuilder,
                                       @Value("${services.chamado.url:http://localhost:8081}") String chamadoBaseUrl) {
        this.webClient = webClientBuilder.baseUrl(chamadoBaseUrl).build();
    }

    public MultiRequestResultadoDTO executarTesteConcorrente(MultiRequestConfigDTO config) {
        log.info("🚀 Iniciando Simulação Multi-Request Concorrente: {} requisições, {} threads concorrentes",
                config.getQuantidade(), config.getConcorrencia());

        long inicioGeral = System.currentTimeMillis();
        ExecutorService executor = Executors.newFixedThreadPool(config.getConcorrencia());

        AtomicInteger sucessos = new AtomicInteger(0);
        AtomicInteger falhas = new AtomicInteger(0);
        List<String> logs = new CopyOnWriteArrayList<>();

        String[] categoriasDisponiveis = {"REDE", "HARDWARE", "SOFTWARE", "ACESSO"};
        String[] prioridadesDisponiveis = {"CRITICA", "ALTA", "MEDIA", "BAIXA"};
        Random random = new Random();

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        for (int i = 1; i <= config.getQuantidade(); i++) {
            final int index = i;
            CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
                String cat = config.getCategoria().equalsIgnoreCase("MISTO")
                        ? categoriasDisponiveis[random.nextInt(categoriasDisponiveis.length)]
                        : config.getCategoria().toUpperCase();

                String prio = config.getPrioridade().equalsIgnoreCase("MISTO")
                        ? prioridadesDisponiveis[random.nextInt(prioridadesDisponiveis.length)]
                        : config.getPrioridade().toUpperCase();

                Map<String, Object> body = Map.of(
                        "titulo", "Carga Concorrente #" + index + " [" + cat + "]",
                        "descricao", "Simulação de teste concorrente gerada pelo motor multi_request.",
                        "categoria", cat,
                        "prioridade", prio
                );

                try {
                    String response = webClient.post()
                            .uri("/chamados")
                            .header("X-Usuario-Id", "user-stress-bot")
                            .bodyValue(body)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();

                    sucessos.incrementAndGet();
                    logs.add("Req #" + index + " [Thread " + Thread.currentThread().getName() + "] -> OK 202: " + response);
                } catch (Exception ex) {
                    falhas.incrementAndGet();
                    logs.add("Req #" + index + " [Thread " + Thread.currentThread().getName() + "] -> FALHA: " + ex.getMessage());
                }
            }, executor);

            futures.add(future);
        }

        // Aguarda todas as tarefas concorrentes finalizarem
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        executor.shutdown();

        long tempoTotal = System.currentTimeMillis() - inicioGeral;
        double tempoMedio = config.getQuantidade() > 0 ? (double) tempoTotal / config.getQuantidade() : 0;
        double rps = tempoTotal > 0 ? ((double) config.getQuantidade() / tempoTotal) * 1000 : 0;

        MultiRequestResultadoDTO resultado = new MultiRequestResultadoDTO();
        resultado.setTotalDisparados(config.getQuantidade());
        resultado.setTotalSucesso(sucessos.get());
        resultado.setTotalFalhas(falhas.get());
        resultado.setTempoTotalMs(tempoTotal);
        resultado.setTempoMedioPorRequisicaoMs(Math.round(tempoMedio * 100.0) / 100.0);
        resultado.setThroughputRps(Math.round(rps * 100.0) / 100.0);
        resultado.setLogsResumo(logs);

        log.info("🏁 Simulação Multi-Request Concluída em {}ms. Sucessos: {}, Falhas: {}, RPS: {}",
                tempoTotal, sucessos.get(), falhas.get(), resultado.getThroughputRps());

        return resultado;
    }
}
