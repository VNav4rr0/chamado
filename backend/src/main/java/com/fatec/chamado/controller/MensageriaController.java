package com.fatec.chamado.controller;

import com.fatec.chamado.model.MensagemLog;
import com.fatec.chamado.service.MensageriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class MensageriaController {

    private final MensageriaService mensageriaService;

    public MensageriaController(MensageriaService mensageriaService) {
        this.mensageriaService = mensageriaService;
    }

    @GetMapping({"/api/mensageria/logs", "/mensageria/logs"})
    public ResponseEntity<List<MensagemLog>> listarLogs() {
        return ResponseEntity.ok(mensageriaService.listarLogsRecentes());
    }

    @PostMapping({"/api/mensageria/teste", "/mensageria/teste"})
    public ResponseEntity<?> dispararTesteManual(@RequestBody(required = false) Map<String, String> body) {
        String texto = (body != null && body.containsKey("texto")) ? body.get("texto") : "Disparo manual via API";
        mensageriaService.dispararMensagemManual(texto);
        return ResponseEntity.ok(Map.of(
                "status", "DISPARADO",
                "mensagem", "Mensageria interna ativada com sucesso!"
        ));
    }
}
