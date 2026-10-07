package com.fatec.mensageria;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class MensageriaServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MensageriaServiceApplication.class, args);
        System.out.println("=================================================");
        System.out.println("📬 [mensageria-service] iniciado na porta 8082");
        System.out.println("⚙️ Fluxo Concorrente & Multi-Request Simulator ativo");
        System.out.println("🗄️ H2 Console: http://localhost:8082/h2-console (JDBC: jdbc:h2:mem:mensageriadb)");
        System.out.println("=================================================");
    }
}
