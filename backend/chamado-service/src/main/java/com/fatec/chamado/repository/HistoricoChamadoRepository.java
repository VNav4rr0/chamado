package com.fatec.chamado.repository;

import com.fatec.chamado.model.HistoricoChamado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoChamadoRepository extends JpaRepository<HistoricoChamado, String> {
    List<HistoricoChamado> findByChamadoIdOrderByDataAsc(String chamadoId);
}
