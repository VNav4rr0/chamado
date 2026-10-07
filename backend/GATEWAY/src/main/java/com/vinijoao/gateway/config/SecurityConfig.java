package com.vinijoao.gateway.config;

import com.vinijoao.gateway.security.CookieBearerTokenConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private static final String ADMIN = "ROLE_ADMIN";

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            CookieBearerTokenConverter tokenConverter,
            ReactiveJwtAuthenticationConverter jwtAuthenticationConverter) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(Customizer.withDefaults())
                .authorizeExchange(auth -> auth
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Rotas públicas de autenticação do serviço LOGIN
                        .pathMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/logout",
                                "/auth/register",
                                "/auth/login",
                                "/auth/logout"
                        ).permitAll()
                        // Rotas do portal Central de Chamados (permite com ou sem JWT)
                        .pathMatchers(
                                "/chamados/**",
                                "/api/chamados/**",
                                "/tecnicos/**",
                                "/api/tecnicos/**",
                                "/mensageria/**",
                                "/api/mensageria/**",
                                "/actuator/**"
                        ).permitAll()
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenConverter(tokenConverter)
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter)))
                .build();
    }

    /** Lê a claim "roles" (ex.: ["ROLE_ADMIN"]) sem acrescentar prefixo duplicado. */
    @Bean
    public ReactiveJwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter conversor = new JwtGrantedAuthoritiesConverter();
        conversor.setAuthoritiesClaimName("roles");
        conversor.setAuthorityPrefix("");

        ReactiveJwtAuthenticationConverter reativo = new ReactiveJwtAuthenticationConverter();
        reativo.setJwtGrantedAuthoritiesConverter(jwt -> Flux.fromIterable(conversor.convert(jwt)));
        return reativo;
    }
}
