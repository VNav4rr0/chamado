package com.vinivictor.api_login.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Username é obrigatório") String username,
        @NotBlank(message = "Password é obrigatória") String password
) {}
