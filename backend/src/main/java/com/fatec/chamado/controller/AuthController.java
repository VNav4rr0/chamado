package com.fatec.chamado.controller;

import com.fatec.chamado.dto.LoginRequest;
import com.fatec.chamado.dto.LoginResponse;
import com.fatec.chamado.dto.RegisterRequest;
import com.fatec.chamado.model.Usuario;
import com.fatec.chamado.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping({"/api/auth/login", "/auth/login"})
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", ex.getMessage(), "status", 401));
        }
    }

    @PostMapping({"/api/auth/register", "/auth/register"})
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Usuario usuarioCriado = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", usuarioCriado.getId(),
                    "username", usuarioCriado.getUsername(),
                    "nome", usuarioCriado.getNome(),
                    "role", usuarioCriado.getRole(),
                    "mensagem", "Conta cadastrada com sucesso! Faça login para continuar."
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", ex.getMessage(), "status", 400));
        }
    }

    @GetMapping({"/api/auth/me", "/auth/me"})
    public ResponseEntity<?> getMe(@RequestHeader(value = "X-Usuario-Id", required = false, defaultValue = "admin") String username) {
        Usuario usuario = authService.findByUsername(username);
        if (usuario != null) {
            return ResponseEntity.ok(Map.of(
                    "id", usuario.getId(),
                    "username", usuario.getUsername(),
                    "nome", usuario.getNome(),
                    "role", usuario.getRole()
            ));
        }
        return ResponseEntity.ok(Map.of(
                "username", username,
                "nome", "Operador",
                "role", "ROLE_USER"
        ));
    }
}
