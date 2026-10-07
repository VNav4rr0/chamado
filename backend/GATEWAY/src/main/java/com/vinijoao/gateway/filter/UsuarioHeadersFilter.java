package com.vinijoao.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class UsuarioHeadersFilter implements GlobalFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String clientUsuarioId = exchange.getRequest().getHeaders().getFirst("X-Usuario-Id");

        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(auth -> auth instanceof JwtAuthenticationToken)
                .cast(JwtAuthenticationToken.class)
                .map(JwtAuthenticationToken::getToken)
                .flatMap(jwt -> {
                    String uid = jwt.getClaimAsString("uid");
                    if (uid == null) {
                        uid = jwt.getSubject();
                    }
                    String role = extrairRole(jwt);

                    final String finalUid = uid;
                    ServerWebExchange mutated = exchange.mutate()
                            .request(r -> r.headers(h -> {
                                h.set("X-Usuario-Id", finalUid != null ? finalUid : "user-fatec-1");
                                if (role != null) h.set("X-Usuario-Role", role);
                            }))
                            .build();
                    return chain.filter(mutated);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    // Sem JWT autenticado: propaga o X-Usuario-Id enviado pelo frontend ou o padrão
                    ServerWebExchange fallbackExchange = exchange.mutate()
                            .request(r -> r.headers(h -> {
                                if (!h.containsKey("X-Usuario-Id") || h.getFirst("X-Usuario-Id") == null || h.getFirst("X-Usuario-Id").isBlank()) {
                                    h.set("X-Usuario-Id", clientUsuarioId != null ? clientUsuarioId : "user-fatec-1");
                                }
                            }))
                            .build();
                    return chain.filter(fallbackExchange);
                }));
    }

    private String extrairRole(Jwt jwt) {
        List<String> roles = jwt.getClaimAsStringList("roles");
        if (roles != null && !roles.isEmpty()) {
            String primeiro = roles.get(0);
            if (primeiro.startsWith("ROLE_")) {
                return primeiro.substring(5);
            }
            return primeiro;
        }
        return null;
    }
}
