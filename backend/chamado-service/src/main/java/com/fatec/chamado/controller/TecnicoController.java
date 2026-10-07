package com.fatec.chamado.controller;

import com.fatec.chamado.dto.PainelCargaResponse;
import com.fatec.chamado.model.CategoriaChamado;
import com.fatec.chamado.model.Tecnico;
import com.fatec.chamado.service.TecnicoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tecnicos")
@CrossOrigin(origins = "*")
public class TecnicoController {

    private final TecnicoService tecnicoService;

    public TecnicoController(TecnicoService tecnicoService) {
        this.tecnicoService = tecnicoService;
    }

    @GetMapping("/carga")
    public ResponseEntity<PainelCargaResponse> getPainelCarga() {
        PainelCargaResponse painel = tecnicoService.getPainelCarga();
        return ResponseEntity.ok(painel);
    }

    @GetMapping
    public ResponseEntity<List<Tecnico>> listarTodos() {
        return ResponseEntity.ok(tecnicoService.listarTodos());
    }

    @GetMapping("/especialidade/{especialidade}")
    public ResponseEntity<List<Tecnico>> buscarPorEspecialidade(@PathVariable("especialidade") CategoriaChamado especialidade) {
        List<Tecnico> disponiveis = tecnicoService.buscarDisponiveisPorEspecialidade(especialidade);
        return ResponseEntity.ok(disponiveis);
    }
}
