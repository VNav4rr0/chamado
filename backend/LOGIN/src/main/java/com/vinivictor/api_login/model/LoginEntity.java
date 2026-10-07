package com.vinivictor.api_login.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "logins")
public class LoginEntity {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "login_roles", joinColumns = @JoinColumn(name = "login_id"))
    @Column(name = "role")
    private List<String> roles = new ArrayList<>();

    public LoginEntity() {}

    public LoginEntity(String id, String username, String password, List<String> roles) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.roles = (roles != null) ? roles : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }

    public Login toDomain() {
        return new Login(this.id, this.username, this.password, this.roles);
    }

    public static LoginEntity fromDomain(Login login) {
        return new LoginEntity(login.id(), login.username(), login.password(), login.roles());
    }
}
