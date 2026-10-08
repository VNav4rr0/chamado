package com.fatec.chamado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ChamadoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChamadoApplication.class, args);
        System.out.println("=============================================================");
        System.out.println("🚀 [Central de Chamados API] iniciada com sucesso na porta 8080");
        System.out.println("🔐 Login & JWT integrados");
        System.out.println("🎫 Gestão de Chamados pronta");
        System.out.println("📬 Motor de Mensageria Assíncrona ativo");
        System.out.println("🗄️ H2 Console: http://localhost:8080/h2-console (JDBC: jdbc:h2:mem:chamadodb)");
        System.out.println("=============================================================");
    }
}
