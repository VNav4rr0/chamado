package com.vinivictor.api_login.repository;

import com.vinivictor.api_login.model.LoginEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpringDataLoginRepository extends JpaRepository<LoginEntity, String> {
    Optional<LoginEntity> findByUsername(String username);
    boolean existsByUsername(String username);
}
