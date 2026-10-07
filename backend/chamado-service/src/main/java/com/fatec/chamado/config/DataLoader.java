package com.fatec.chamado.config;

import com.fatec.chamado.model.*;
import com.fatec.chamado.repository.ChamadoRepository;
import com.fatec.chamado.repository.TecnicoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner initChamadoData(TecnicoRepository tecnicoRepository, ChamadoRepository chamadoRepository) {
        return args -> {
            if (tecnicoRepository.count() == 0) {
                // 1. Cadastra os 8 técnicos padrão idênticos ao front-end
                List<Tecnico> tecnicos = Arrays.asList(
                        new Tecnico(1L, "Roberto Redes", CategoriaChamado.REDE, 1, 2, true),
                        new Tecnico(2L, "Renata Roteadores", CategoriaChamado.REDE, 2, 4, true),
                        new Tecnico(3L, "Hugo Hardware", CategoriaChamado.HARDWARE, 1, 3, true),
                        new Tecnico(4L, "Helena Hard", CategoriaChamado.HARDWARE, 0, 5, true),
                        new Tecnico(5L, "Sofia Software", CategoriaChamado.SOFTWARE, 3, 4, true),
                        new Tecnico(6L, "Samuel Sistemas", CategoriaChamado.SOFTWARE, 1, 2, true),
                        new Tecnico(7L, "Alice Acessos", CategoriaChamado.ACESSO, 1, 3, true),
                        new Tecnico(8L, "Arthur Autenticação", CategoriaChamado.ACESSO, 2, 6, true)
                );
                tecnicoRepository.saveAll(tecnicos);
                System.out.println("✅ [chamado-service] 8 técnicos inseridos no H2!");
            }

            if (chamadoRepository.count() == 0) {
                Instant now = Instant.now();

                // Chamado c-101
                Chamado c101 = new Chamado("c-101", "user-fatec-1", "Queda de conexão no Bloco B",
                        "Os switches do segundo andar pararam de responder após oscilação de energia.",
                        CategoriaChamado.REDE, PrioridadeChamado.CRITICA);
                c101.setStatus(StatusChamado.EM_ATENDIMENTO);
                c101.setProtocolo("CH-2026-000101");
                c101.setTecnicoId(1L);
                c101.setTecnicoNome("Roberto Redes");
                c101.setCriadoEm(now.minus(90, ChronoUnit.MINUTES).toString());
                c101.setSlaPrazo(now.plus(150, ChronoUnit.MINUTES).toString());
                c101.adicionarHistorico(new HistoricoChamado("h-1", "c-101", null, StatusChamado.ABERTO,
                        now.minus(90, ChronoUnit.MINUTES).toString(),
                        "Chamado aberto pelo usuário. Evento ChamadoAbertoEvent registrado no Outbox."));
                c101.adicionarHistorico(new HistoricoChamado("h-2", "c-101", StatusChamado.ABERTO, StatusChamado.EM_ATENDIMENTO,
                        now.minus(84, ChronoUnit.MINUTES).toString(),
                        "Consumo do evento RabbitMQ pelo atendimento-service. Técnico Roberto Redes atribuído. Protocolo CH-2026-000101 gerado com SLA de 4 horas."));

                // Chamado c-102
                Chamado c102 = new Chamado("c-102", "user-fatec-1", "Instalação do Docker e JDK 21 no Lab 04",
                        "Necessário preparar as máquinas para a aula prática de microsserviços.",
                        CategoriaChamado.SOFTWARE, PrioridadeChamado.MEDIA);
                c102.setStatus(StatusChamado.EM_ATENDIMENTO);
                c102.setProtocolo("CH-2026-000102");
                c102.setTecnicoId(6L);
                c102.setTecnicoNome("Samuel Sistemas");
                c102.setCriadoEm(now.minus(6, ChronoUnit.HOURS).toString());
                c102.setSlaPrazo(now.plus(18, ChronoUnit.HOURS).toString());
                c102.adicionarHistorico(new HistoricoChamado("h-3", "c-102", null, StatusChamado.ABERTO,
                        now.minus(6, ChronoUnit.HOURS).toString(),
                        "Chamado cadastrado no sistema (Status 202 Accepted)."));
                c102.adicionarHistorico(new HistoricoChamado("h-4", "c-102", StatusChamado.ABERTO, StatusChamado.EM_ATENDIMENTO,
                        now.minus(350, ChronoUnit.MINUTES).toString(),
                        "Técnico Samuel Sistemas (menor carga em SOFTWARE) alocado. SLA definido para 24 horas."));

                // Chamado c-103
                Chamado c103 = new Chamado("c-103", "user-fatec-1", "Reset de credenciais de VPN corporativa",
                        "Não consigo autenticar na VPN após expiração da senha temporária.",
                        CategoriaChamado.ACESSO, PrioridadeChamado.ALTA);
                c103.setStatus(StatusChamado.RESOLVIDO);
                c103.setProtocolo("CH-2026-000098");
                c103.setTecnicoId(7L);
                c103.setTecnicoNome("Alice Acessos");
                c103.setCriadoEm(now.minus(10, ChronoUnit.HOURS).toString());
                c103.setSlaPrazo(now.minus(2, ChronoUnit.HOURS).toString());
                c103.adicionarHistorico(new HistoricoChamado("h-5", "c-103", null, StatusChamado.ABERTO,
                        now.minus(10, ChronoUnit.HOURS).toString(),
                        "Chamado aberto pelo portal."));
                c103.adicionarHistorico(new HistoricoChamado("h-6", "c-103", StatusChamado.ABERTO, StatusChamado.EM_ATENDIMENTO,
                        now.minus(590, ChronoUnit.MINUTES).toString(),
                        "Técnica Alice Acessos assumiu o chamado."));
                c103.adicionarHistorico(new HistoricoChamado("h-7", "c-103", StatusChamado.EM_ATENDIMENTO, StatusChamado.RESOLVIDO,
                        now.minus(4, ChronoUnit.HOURS).toString(),
                        "Senha provisória enviada e autenticação em dois fatores restabelecida."));

                // Chamado c-104
                Chamado c104 = new Chamado("c-104", "user-fatec-1", "Monitor piscando e sem sinal HDMI",
                        "Monitor Dell 27 polegadas da estação 12 desliga intermitentemente.",
                        CategoriaChamado.HARDWARE, PrioridadeChamado.BAIXA);
                c104.setStatus(StatusChamado.AGUARDANDO_TECNICO);
                c104.setCriadoEm(now.minus(30, ChronoUnit.MINUTES).toString());
                c104.adicionarHistorico(new HistoricoChamado("h-8", "c-104", null, StatusChamado.ABERTO,
                        now.minus(30, ChronoUnit.MINUTES).toString(),
                        "Chamado registrado com sucesso."));
                c104.adicionarHistorico(new HistoricoChamado("h-9", "c-104", StatusChamado.ABERTO, StatusChamado.AGUARDANDO_TECNICO,
                        now.minus(28, ChronoUnit.MINUTES).toString(),
                        "Fila de espera ativada (atribuicao.falhou). Aguardando liberação de capacidade dos técnicos de Hardware."));

                chamadoRepository.saveAll(Arrays.asList(c101, c102, c103, c104));
                System.out.println("✅ [chamado-service] 4 chamados iniciais inseridos no H2!");
            }
        };
    }
}
