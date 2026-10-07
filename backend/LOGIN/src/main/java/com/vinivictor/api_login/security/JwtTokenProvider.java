package com.vinivictor.api_login.security;

import com.vinivictor.api_login.model.Login;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:minha-chave-secreta-super-segura-jwt-fatec-2026-com-ao-menos-256-bits!}")
    private String secret;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Login login) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        Map<String, Object> claims = new HashMap<>();
        // Claims essenciais consumidas pelo GATEWAY (UsuarioHeadersFilter)
        claims.put("uid", login.id());
        claims.put("roles", login.roles());

        return Jwts.builder()
                .setSubject(login.username())
                .addClaims(claims)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}
