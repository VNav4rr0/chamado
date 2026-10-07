package com.fatec.chamado.controller;

import com.fatec.chamado.dto.AtualizacaoAtribuicaoDTO;
import com.fatec.chamado.dto.ChamadoCriadoResponse;
import com.fatec.chamado.dto.CriarChamadoDTO;
import com.fatec.chamado.model.Chamado;
import com.fatec.chamado.service.ChamadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chamados")
@CrossOrigin(origins = "*")
public class ChamadoController {

    private final ChamadoService chamadoService;

    public ChamadoController(ChamadoService chamadoService) {
        this.chamadoService = chamadoService;
    }

    @GetMapping
    public ResponseEntity<List<Chamado>> listarChamados(
            @RequestParam(value = "usuarioId", required = false) String queryUsuarioId,
            @RequestHeader(value = "X-Usuario-Id", required = false) String headerUsuarioId) {

        String usuarioId = (queryUsuarioId != null && !queryUsuarioId.isBlank())
                ? queryUsuarioId
                : headerUsuarioId;

        List<Chamado> lista = chamadoService.listar(usuarioId);
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chamado> buscarPorId(@PathVariable("id") String id) {
        return chamadoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ChamadoCriadoResponse> criarChamado(
            @Valid @RequestBody CriarChamadoDTO dto,
            @RequestHeader(value = "X-Usuario-Id", required = false, defaultValue = "user-fatec-1") String usuarioId) {

        ChamadoCriadoResponse response = chamadoService.criarChamado(dto, usuarioId);
        // Retorna HTTP 202 Accepted conforme especificado no frontend
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @PatchMapping("/{id}/resolver")
    public ResponseEntity<Chamado> resolverChamado(@PathVariable("id") String id) {
        try {
            Chamado resolvido = chamadoService.resolverChamado(id);
            return ResponseEntity.ok(resolvido);
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/atribuicao")
    public ResponseEntity<Chamado> atualizarAtribuicao(
            @PathVariable("id") String id,
            @RequestBody AtualizacaoAtribuicaoDTO dto) {
        try {
            Chamado atualizado = chamadoService.atualizarAtribuicao(id, dto);
            return ResponseEntity.ok(atualizado);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
