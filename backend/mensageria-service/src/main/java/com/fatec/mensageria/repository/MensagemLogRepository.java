package com.fatec.mensageria.repository;

import com.fatec.mensageria.model.MensagemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MensagemLogRepository extends JpaRepository<MensagemLog, Long> {
    List<MensagemLog> findTop50ByOrderByDataHoraDesc();
    long countByStatusProcessamento(String statusProcessamento);
}
