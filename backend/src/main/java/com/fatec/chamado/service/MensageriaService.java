package com.fatec.chamado.service;

import com.fatec.chamado.model.Chamado;
import com.fatec.chamado.model.MensagemLog;
import com.fatec.chamado.repository.MensagemLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MensageriaService {

    private static final Logger log = LoggerFactory.getLogger(MensageriaService.class);

    private final MensagemLogRepository mensagemLogRepository;

    @Value("${mensageria.simulacao-delay-ms:1200}")
    private long simulacaoDelayMs;

    public MensageriaService(MensagemLogRepository mensagemLogRepository) {
        this.mensagemLogRepository = mensagemLogRepository;
    }

    /**
     * Simula o disparo de mensageria assíncrona orientada a eventos
     * executado em thread separada com logs claros no console e persistência no H2.
     */
    @Async
    public void dispararEventoChamadoCriado(Chamado chamado) {
        String thread = Thread.currentThread().getName();

        // 1. Etapa de Disparo
        System.out.println("\n==========================================================================");
        System.out.printf("📢 [MENSAGERIA ASSÍNCRONA] Evento ChamadoCriadoEvent recebido na fila interna!\n");
        System.out.printf("   Chamado ID : %s\n", chamado.getId());
        System.out.printf("   Título     : %s\n", chamado.getTitulo());
        System.out.printf("   Usuário    : %s\n", chamado.getUsuarioId());
        System.out.printf("   Thread     : [%s]\n", thread);
        System.out.println("==========================================================================");

        gravarLog(chamado.getId(), "DISPARO",
                String.format("Evento de criação publicado no broker interno para o chamado '%s'", chamado.getTitulo()), thread);

        try {
            // Simula latência de enfileiramento e roteamento
            Thread.sleep(simulacaoDelayMs / 2);

            System.out.printf("📥 [MENSAGERIA] Evento enfileirado no tópico 'fila.chamados.novos' [Thread: %s]\n", thread);
            gravarLog(chamado.getId(), "FILA",
                    String.format("Mensagem alocada na partição de atendimento com sucesso."), thread);

            // Simula tempo de processamento pelo worker
            Thread.sleep(simulacaoDelayMs / 2);

            System.out.printf("⚙️ [MENSAGERIA] Worker assíncrono consumiu o evento e gerou a notificação técnica.\n");
            gravarLog(chamado.getId(), "WORKER",
                    String.format("Consumidor assíncrono validou dados e despachou notificação."), thread);

            System.out.println("==========================================================================");
            System.out.printf("✅ [MENSAGERIA ASSÍNCRONA] Notificação entregue com sucesso! ACK confirmado.\n");
            System.out.printf("   Destino : Canal de Notificações / Equipe de Atendimento\n");
            System.out.println("==========================================================================\n");

            gravarLog(chamado.getId(), "SUCESSO",
                    String.format("Mensagem entregue e confirmada (ACK) para o chamado %s.", chamado.getId()), thread);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Simulação de mensageria interrompida: {}", e.getMessage());
        }
    }

    @Async
    public void dispararMensagemManual(String texto) {
        String thread = Thread.currentThread().getName();
        System.out.println("\n⚡ [MENSAGERIA MANUAL] Disparo forçado de mensagem de teste executado no backend!");
        gravarLog("TESTE-MANUAL", "DISPARO", "Disparo de mensagem manual solicitado: " + texto, thread);

        try {
            Thread.sleep(600);
            gravarLog("TESTE-MANUAL", "SUCESSO", "Mensagem manual processada e confirmada pelo broker.", thread);
            System.out.println("✅ [MENSAGERIA MANUAL] Teste concluído com sucesso!\n");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void gravarLog(String chamadoId, String tipo, String mensagem, String thread) {
        MensagemLog logEntity = new MensagemLog(chamadoId, tipo, mensagem, thread);
        mensagemLogRepository.save(logEntity);
    }

    public List<MensagemLog> listarLogsRecentes() {
        return mensagemLogRepository.findTop30ByOrderByIdDesc();
    }
}
