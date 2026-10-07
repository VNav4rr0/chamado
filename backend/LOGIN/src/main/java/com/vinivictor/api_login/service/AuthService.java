package com.vinivictor.api_login.service;

import com.vinivictor.api_login.dto.LoginRequest;
import com.vinivictor.api_login.dto.LoginResponse;
import com.vinivictor.api_login.dto.RegisterRequest;
import com.vinivictor.api_login.model.Login;
import com.vinivictor.api_login.repository.LoginRepository;
import com.vinivictor.api_login.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final LoginRepository loginRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(LoginRepository loginRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider) {
        this.loginRepository = loginRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public LoginResponse authenticate(LoginRequest request) {
        Login login = loginRepository.findByUsername(request.username());
        if (login == null) {
            throw new RuntimeException("Credenciais inválidas: Usuário não encontrado");
        }

        if (!passwordEncoder.matches(request.password(), login.password())) {
            throw new RuntimeException("Credenciais inválidas: Senha incorreta");
        }

        String token = jwtTokenProvider.generateToken(login);

        return new LoginResponse(
                token,
                "Bearer",
                login.username(),
                login.id(),
                login.roles()
        );
    }

    public Login register(RegisterRequest request) {
        if (loginRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Nome de usuário já está em uso");
        }

        String id = (request.id() != null && !request.id().isBlank())
                ? request.id()
                : "user-" + UUID.randomUUID().toString().substring(0, 8);

        List<String> roles = (request.roles() != null && !request.roles().isEmpty())
                ? request.roles()
                : List.of("ROLE_USER");

        Login novo = new Login(
                id,
                request.username(),
                passwordEncoder.encode(request.password()),
                roles
        );

        return loginRepository.save(novo);
    }

    public Login findByUsername(String username) {
        return loginRepository.findByUsername(username);
    }
}
