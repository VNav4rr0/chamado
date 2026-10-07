package com.vinivictor.api_login.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record RegisterRequest(
        @NotBlank(message = "Username é obrigatório") String username,
        @NotBlank(message = "Password é obrigatória") String password,
        String id,
        List<String> roles
) {}
