package com.vinivictor.api_login.config;

import com.vinivictor.api_login.model.Login;
import com.vinivictor.api_login.repository.LoginRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner initLoginData(LoginRepository loginRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (loginRepository.findByUsername("user-fatec-1") == null) {
                Login usuario = new Login(
                        "user-fatec-1",
                        "user-fatec-1",
                        passwordEncoder.encode("123456"),
                        List.of("ROLE_USER")
                );
                loginRepository.save(usuario);

                Login admin = new Login(
                        "admin-01",
                        "admin",
                        passwordEncoder.encode("admin123"),
                        List.of("ROLE_ADMIN")
                );
                loginRepository.save(admin);

                System.out.println("✅ [LOGIN-SERVICE] Usuários pré-cadastrados no H2: 'user-fatec-1' (senha: 123456) e 'admin' (senha: admin123)");
            }
        };
    }
}
