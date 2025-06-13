package com.ProjectP.titanwebapp.service;

import com.ProjectP.titanwebapp.model.CreateAccount;
import com.ProjectP.titanwebapp.repo.CreateAccountRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CreateAccountService {

    @Autowired
    private CreateAccountRepo repo;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Method to save account (signup)
    public CreateAccount saveAccount(String name, String role, String userName, String email, String password) {
        // Check if email or username already exists
        if (repo.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        if (repo.existsByUserName(userName)) {
            throw new RuntimeException("Username already exists");
        }

        CreateAccount createAccount = new CreateAccount();
        createAccount.setName(name);
        createAccount.setRole(role);
        createAccount.setUserName(userName);
        createAccount.setEmail(email);
        // Hash the password before saving
        createAccount.setPassword(passwordEncoder.encode(password));

        return repo.save(createAccount);
    }

    // Method to authenticate user (login)
    public CreateAccount authenticateUser(String emailOrUsername, String password) {
        // Try to find user by email first, then by username
        Optional<CreateAccount> userOptional = repo.findByEmail(emailOrUsername);
        if (userOptional.isEmpty()) {
            userOptional = repo.findByUserName(emailOrUsername);
        }

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        CreateAccount user = userOptional.get();

        // Check if password matches
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    // Method to find user by email
    public Optional<CreateAccount> findByEmail(String email) {
        return repo.findByEmail(email);
    }

    // Method to find user by username
    public Optional<CreateAccount> findByUserName(String userName) {
        return repo.findByUserName(userName);
    }

    // Method to check if email exists
    public boolean emailExists(String email) {
        return repo.existsByEmail(email);
    }

    // Method to check if username exists
    public boolean usernameExists(String userName) {
        return repo.existsByUserName(userName);
    }
}