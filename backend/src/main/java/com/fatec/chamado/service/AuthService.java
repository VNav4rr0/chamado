package com.fatec.chamado.service;

import com.fatec.chamado.dto.LoginRequest;
import com.fatec.chamado.dto.LoginResponse;
import com.fatec.chamado.dto.RegisterRequest;
import com.fatec.chamado.model.Usuario;
import com.fatec.chamado.repository.UsuarioRepository;
import com.fatec.chamado.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse authenticate(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado ou credenciais inválidas"));

        if (!passwordEncoder.matches(request.getPassword().trim(), usuario.getPassword())) {
            throw new RuntimeException("Credenciais inválidas: senha incorreta");
        }

        String token = jwtService.generateToken(usuario.getUsername(), usuario.getRole(), usuario.getNome());

        return new LoginResponse(
                token,
                usuario.getUsername(),
                usuario.getNome(),
                usuario.getRole()
        );
    }

    public Usuario register(RegisterRequest request) {
        String username = request.getUsername().trim();
        if (usuarioRepository.existsByUsername(username)) {
            throw new RuntimeException("Nome de usuário já está em uso: " + username);
        }

        String role = request.isAdmin() ? "ROLE_ADMIN" : "ROLE_USER";

        Usuario novo = new Usuario(
                username,
                passwordEncoder.encode(request.getPassword().trim()),
                request.getNome().trim(),
                role
        );

        return usuarioRepository.save(novo);
    }

    public Usuario findByUsername(String username) {
        return usuarioRepository.findByUsername(username).orElse(null);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
}
