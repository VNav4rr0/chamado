package com.fatec.chamado.service;

import com.fatec.chamado.dto.CriarChamadoDTO;
import com.fatec.chamado.model.Chamado;
import com.fatec.chamado.repository.ChamadoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ChamadoService {

    private final ChamadoRepository chamadoRepository;
    private final MensageriaService mensageriaService;
    private final AtomicInteger sequencial = new AtomicInteger(100);

    public ChamadoService(ChamadoRepository chamadoRepository, MensageriaService mensageriaService) {
        this.chamadoRepository = chamadoRepository;
        this.mensageriaService = mensageriaService;
    }

    public List<Chamado> listarTodos() {
        return chamadoRepository.findAllByOrderByCriadoEmDesc();
    }

    public List<Chamado> listarPorUsuario(String usuarioId) {
        if (usuarioId != null && !usuarioId.isBlank()) {
            return chamadoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
        }
        return listarTodos();
    }

    public Chamado criarChamado(CriarChamadoDTO dto, String usuarioId) {
        String uid = (usuarioId != null && !usuarioId.isBlank()) ? usuarioId : "admin";
        String id = "CH-" + sequencial.incrementAndGet();

        Chamado chamado = new Chamado(id, dto.getTitulo().trim(), dto.getDescricao().trim(), uid);
        Chamado salvo = chamadoRepository.save(chamado);

        // Dispara o fluxo assíncrono de mensageria
        mensageriaService.dispararEventoChamadoCriado(salvo);

        return salvo;
    }

    public Chamado buscarPorId(String id) {
        return chamadoRepository.findById(id).orElse(null);
    }

    public Chamado atualizarStatus(String id, String novoStatus) {
        Chamado chamado = chamadoRepository.findById(id).orElse(null);
        if (chamado != null) {
            chamado.setStatus(novoStatus);
            Chamado atualizado = chamadoRepository.save(chamado);
            mensageriaService.dispararMensagemManual("Chamado " + id + " atualizado para '" + novoStatus + "' pelo Administrador.");
            return atualizado;
        }
        return null;
    }

    public boolean deletarChamado(String id) {
        if (chamadoRepository.existsById(id)) {
            chamadoRepository.deleteById(id);
            mensageriaService.dispararMensagemManual("Chamado " + id + " excluído do sistema pelo Administrador.");
            return true;
        }
        return false;
    }
}
