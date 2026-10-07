package com.vinivictor.api_login;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LoginApplication {

    public static void main(String[] args) {
        SpringApplication.run(LoginApplication.class, args);
        System.out.println("=================================================");
        System.out.println("🔐 [LOGIN-SERVICE] iniciado na porta 8083");
        System.out.println("🗄️ H2 Console: http://localhost:8083/h2-console (JDBC: jdbc:h2:mem:logindb)");
        System.out.println("=================================================");
    }
}
