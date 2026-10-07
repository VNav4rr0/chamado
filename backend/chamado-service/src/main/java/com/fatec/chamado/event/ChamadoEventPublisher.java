package com.fatec.chamado.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class ChamadoEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ChamadoEventPublisher.class);

    private final WebClient webClient;
    private final String mensageriaBaseUrl;

    public ChamadoEventPublisher(WebClient.Builder webClientBuilder,
                                 @Value("${services.mensageria.url:http://localhost:8082}") String mensageriaBaseUrl) {
        this.mensageriaBaseUrl = mensageriaBaseUrl;
        this.webClient = webClientBuilder.baseUrl(mensageriaBaseUrl).build();
    }

    @Async
    public void publicarChamadoCriado(ChamadoCriadoEvent event) {
        log.info("📢 Publicando evento de mensageria interna: ChamadoAbertoEvent [chamadoId={}, categoria={}]",
                event.getChamadoId(), event.getCategoria());

        try {
            this.webClient.post()
                    .uri("/mensageria/eventos/chamado-criado")
                    .bodyValue(event)
                    .retrieve()
                    .toBodilessEntity()
                    .doOnSuccess(resp -> log.info("✅ Evento ChamadoAbertoEvent aceito pelo mensageria-service"))
                    .doOnError(err -> log.warn("⚠️ Falha ao comunicar evento ao mensageria-service: {}", err.getMessage()))
                    .subscribe();
        } catch (Exception ex) {
            log.warn("⚠️ Não foi possível despachar o evento para mensageria-service: {}", ex.getMessage());
        }
    }

    @Async
    public void publicarChamadoResolvido(ChamadoResolvidoEvent event) {
        log.info("📢 Publicando evento de mensageria interna: ChamadoResolvidoEvent [chamadoId={}, categoria={}]",
                event.getChamadoId(), event.getCategoria());

        try {
            this.webClient.post()
                    .uri("/mensageria/eventos/chamado-resolvido")
                    .bodyValue(event)
                    .retrieve()
                    .toBodilessEntity()
                    .doOnSuccess(resp -> log.info("✅ Evento ChamadoResolvidoEvent aceito pelo mensageria-service"))
                    .doOnError(err -> log.warn("⚠️ Falha ao comunicar evento de resolução ao mensageria-service: {}", err.getMessage()))
                    .subscribe();
        } catch (Exception ex) {
            log.warn("⚠️ Não foi possível despachar evento de resolução para mensageria-service: {}", ex.getMessage());
        }
    }
}
