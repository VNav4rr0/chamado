package com.fatec.chamado.controller;

import com.fatec.chamado.dto.CriarChamadoDTO;
import com.fatec.chamado.model.Chamado;
import com.fatec.chamado.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class ChamadoController {

    private final ChamadoService chamadoService;

    public ChamadoController(ChamadoService chamadoService) {
        this.chamadoService = chamadoService;
    }

    @GetMapping({"/api/chamados", "/chamados"})
    public ResponseEntity<List<Chamado>> listar(
            @RequestParam(value = "usuarioId", required = false) String usuarioId,
            @RequestHeader(value = "X-Usuario-Id", required = false) String headerUsuario) {

        String filtro = (usuarioId != null && !usuarioId.isBlank()) ? usuarioId : headerUsuario;
        List<Chamado> lista = chamadoService.listarPorUsuario(filtro);
        return ResponseEntity.ok(lista);
    }

    @PostMapping({"/api/chamados", "/chamados"})
    public ResponseEntity<Chamado> criar(
            @Valid @RequestBody CriarChamadoDTO dto,
            @RequestHeader(value = "X-Usuario-Id", required = false, defaultValue = "admin") String usuarioId) {

        Chamado criado = chamadoService.criarChamado(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(criado);
    }

    @GetMapping({"/api/chamados/{id}", "/chamados/{id}"})
    public ResponseEntity<Chamado> buscarPorId(@PathVariable("id") String id) {
        Chamado chamado = chamadoService.buscarPorId(id);
        if (chamado != null) {
            return ResponseEntity.ok(chamado);
        }
        return ResponseEntity.notFound().build();
    }
}
