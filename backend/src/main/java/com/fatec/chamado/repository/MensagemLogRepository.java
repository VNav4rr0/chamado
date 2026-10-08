package com.fatec.chamado.repository;

import com.fatec.chamado.model.MensagemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensagemLogRepository extends JpaRepository<MensagemLog, Long> {
    List<MensagemLog> findTop30ByOrderByIdDesc();
}
