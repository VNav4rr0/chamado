package com.fatec.chamado.config;

import com.fatec.chamado.model.Chamado;
import com.fatec.chamado.model.Usuario;
import com.fatec.chamado.repository.ChamadoRepository;
import com.fatec.chamado.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner initDatabase(UsuarioRepository usuarioRepository,
                                         ChamadoRepository chamadoRepository,
                                         PasswordEncoder passwordEncoder) {
        return args -> {
            if (usuarioRepository.count() == 0) {
                Usuario admin = new Usuario("admin", passwordEncoder.encode("admin123"), "Administrador TI", "ROLE_ADMIN");
                Usuario user = new Usuario("user", passwordEncoder.encode("123456"), "Estudante FATEC", "ROLE_USER");
                usuarioRepository.saveAll(List.of(admin, user));

                System.out.println("✅ [H2 DataLoader] Usuários cadastrados:");
                System.out.println("   👉 admin / admin123 (ROLE_ADMIN)");
                System.out.println("   👉 user  / 123456   (ROLE_USER)");
            }

            if (chamadoRepository.count() == 0) {
                Chamado c1 = new Chamado("CH-1001", "Instalação do Docker e Java 21",
                        "Necessário preparar ambiente para testes práticos de desenvolvimento.", "admin");
                c1.setStatus("CONCLUIDO");

                Chamado c2 = new Chamado("CH-1002", "Instabilidade na conexão do Bloco B",
                        "Roteador do segundo andar apresenta oscilações intermitentes.", "user");
                c2.setStatus("EM_PROCESSAMENTO");

                Chamado c3 = new Chamado("CH-1003", "Reset de credenciais de VPN",
                        "Usuário bloqueado após tentativas repetidas de senha incorreta.", "admin");
                c3.setStatus("ABERTO");

                chamadoRepository.saveAll(List.of(c1, c2, c3));
                System.out.println("✅ [H2 DataLoader] Chamados iniciais de demonstração inseridos!");
            }
        };
    }
}
