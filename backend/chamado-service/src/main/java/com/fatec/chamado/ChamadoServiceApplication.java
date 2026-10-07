package com.fatec.chamado;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ChamadoServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChamadoServiceApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🎫 [chamado-service] iniciado na porta 8081");
        System.out.println("🗄️ H2 Console: http://localhost:8081/h2-console (JDBC: jdbc:h2:mem:chamadodb)");
        System.out.println("=================================================");
    }
}
