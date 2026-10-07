package com.fatec.mensageria.controller;

import com.fatec.mensageria.dto.MultiRequestConfigDTO;
import com.fatec.mensageria.dto.MultiRequestResultadoDTO;
import com.fatec.mensageria.service.MultiRequestStressSimulator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mensageria/simulador")
@CrossOrigin(origins = "*")
public class MultiRequestSimulatorController {

    private final MultiRequestStressSimulator simulator;

    public MultiRequestSimulatorController(MultiRequestStressSimulator simulator) {
        this.simulator = simulator;
    }

    @PostMapping("/multi-request")
    public ResponseEntity<MultiRequestResultadoDTO> dispararMultiRequest(@RequestBody(required = false) MultiRequestConfigDTO config) {
        if (config == null) {
            config = new MultiRequestConfigDTO();
        }
        MultiRequestResultadoDTO resultado = simulator.executarTesteConcorrente(config);
        return ResponseEntity.ok(resultado);
    }
}
