package com.vinivictor.api_login.repository;

import com.vinivictor.api_login.model.Login;

public interface LoginRepository {
    Login save(Login login);
    void delete(String id);
    Login update(Login login);
    Login findById(String id);
    Login findByUsername(String username);
    boolean existsByUsername(String username);
}
