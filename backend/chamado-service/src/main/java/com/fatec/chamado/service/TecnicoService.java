package com.fatec.chamado.service;

import com.fatec.chamado.dto.PainelCargaResponse;
import com.fatec.chamado.model.CategoriaChamado;
import com.fatec.chamado.model.Tecnico;
import com.fatec.chamado.repository.TecnicoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TecnicoService {

    private final TecnicoRepository tecnicoRepository;

    public TecnicoService(TecnicoRepository tecnicoRepository) {
        this.tecnicoRepository = tecnicoRepository;
    }

    public List<Tecnico> listarTodos() {
        return tecnicoRepository.findAll();
    }

    public Optional<Tecnico> buscarPorId(Long id) {
        return tecnicoRepository.findById(id);
    }

    public List<Tecnico> buscarDisponiveisPorEspecialidade(CategoriaChamado especialidade) {
        return tecnicoRepository.findByAtivoTrueAndEspecialidadeOrderByCargaAtualAsc(especialidade);
    }

    public PainelCargaResponse getPainelCarga() {
        List<Tecnico> tecnicos = tecnicoRepository.findAll();
        int totalCarga = tecnicos.stream().mapToInt(Tecnico::getCargaAtual).sum();
        int totalCapacidade = tecnicos.stream().mapToInt(Tecnico::getCapacidadeMax).sum();
        int percentualGeral = totalCapacidade > 0 ? (int) Math.round(((double) totalCarga / totalCapacidade) * 100) : 0;

        return new PainelCargaResponse(tecnicos, totalCarga, totalCapacidade, percentualGeral);
    }

    @Transactional
    public Tecnico incrementarCarga(Long tecnicoId) {
        Tecnico t = tecnicoRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico não encontrado"));
        t.setCargaAtual(t.getCargaAtual() + 1);
        return tecnicoRepository.save(t);
    }

    @Transactional
    public Tecnico decrementarCarga(Long tecnicoId) {
        Tecnico t = tecnicoRepository.findById(tecnicoId)
                .orElseThrow(() -> new RuntimeException("Técnico não encontrado"));
        t.setCargaAtual(Math.max(0, t.getCargaAtual() - 1));
        return tecnicoRepository.save(t);
    }
}
