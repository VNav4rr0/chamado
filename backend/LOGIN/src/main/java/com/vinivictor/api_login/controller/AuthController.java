package com.vinivictor.api_login.controller;

import com.vinivictor.api_login.dto.LoginRequest;
import com.vinivictor.api_login.dto.LoginResponse;
import com.vinivictor.api_login.dto.RegisterRequest;
import com.vinivictor.api_login.model.Login;
import com.vinivictor.api_login.service.AuthService;
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
            Login salvo = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "id", salvo.id(),
                            "username", salvo.username(),
                            "roles", salvo.roles(),
                            "mensagem", "Usuário registrado com sucesso"
                    ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("erro", ex.getMessage(), "status", 400));
        }
    }

    @PostMapping({"/api/auth/logout", "/auth/logout"})
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("mensagem", "Logout efetuado com sucesso"));
    }

    @GetMapping({"/api/auth/me", "/auth/me"})
    public ResponseEntity<?> me(@RequestHeader(value = "X-Usuario-Id", required = false, defaultValue = "user-fatec-1") String usuarioId) {
        Login login = authService.findByUsername(usuarioId);
        if (login != null) {
            return ResponseEntity.ok(Map.of(
                    "id", login.id(),
                    "username", login.username(),
                    "roles", login.roles()
            ));
        }
        return ResponseEntity.ok(Map.of("id", usuarioId, "username", usuarioId, "roles", java.util.List.of("ROLE_USER")));
    }
}
