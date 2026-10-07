package com.vinivictor.api_login.repository;

import com.vinivictor.api_login.model.Login;
import com.vinivictor.api_login.model.LoginEntity;
import org.springframework.stereotype.Component;

@Component
public class LoginRepositoryImpl implements LoginRepository {

    private final SpringDataLoginRepository springDataRepo;

    public LoginRepositoryImpl(SpringDataLoginRepository springDataRepo) {
        this.springDataRepo = springDataRepo;
    }

    @Override
    public Login save(Login login) {
        LoginEntity entity = LoginEntity.fromDomain(login);
        LoginEntity salvo = springDataRepo.save(entity);
        return salvo.toDomain();
    }

    @Override
    public void delete(String id) {
        springDataRepo.deleteById(id);
    }

    @Override
    public Login update(Login login) {
        LoginEntity entity = LoginEntity.fromDomain(login);
        LoginEntity salvo = springDataRepo.save(entity);
        return salvo.toDomain();
    }

    @Override
    public Login findById(String id) {
        return springDataRepo.findById(id).map(LoginEntity::toDomain).orElse(null);
    }

    @Override
    public Login findByUsername(String username) {
        return springDataRepo.findByUsername(username).map(LoginEntity::toDomain).orElse(null);
    }

    @Override
    public boolean existsByUsername(String username) {
        return springDataRepo.existsByUsername(username);
    }
}
