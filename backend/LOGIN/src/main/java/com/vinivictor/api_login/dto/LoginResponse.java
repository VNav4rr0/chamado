package com.vinivictor.api_login.dto;

import java.util.List;

public record LoginResponse(
        String token,
        String type,
        String username,
        String usuarioId,
        List<String> roles
) {}
