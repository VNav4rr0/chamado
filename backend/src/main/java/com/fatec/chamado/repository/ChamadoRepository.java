package com.fatec.chamado.repository;

import com.fatec.chamado.model.Chamado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChamadoRepository extends JpaRepository<Chamado, String> {
    List<Chamado> findAllByOrderByCriadoEmDesc();
    List<Chamado> findByUsuarioIdOrderByCriadoEmDesc(String usuarioId);
}
