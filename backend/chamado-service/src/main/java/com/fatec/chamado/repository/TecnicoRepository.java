package com.fatec.chamado.repository;

import com.fatec.chamado.model.CategoriaChamado;
import com.fatec.chamado.model.Tecnico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TecnicoRepository extends JpaRepository<Tecnico, Long> {
    List<Tecnico> findByAtivoTrue();
    List<Tecnico> findByAtivoTrueAndEspecialidadeOrderByCargaAtualAsc(CategoriaChamado especialidade);
}
