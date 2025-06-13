package com.ProjectP.titanwebapp.repo;

import com.ProjectP.titanwebapp.model.CreateAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreateAccountRepo extends JpaRepository<CreateAccount, Long> {

    // Find user by email
    Optional<CreateAccount> findByEmail(String email);

    // Find user by username
    Optional<CreateAccount> findByUserName(String userName);

    // Check if email exists
    boolean existsByEmail(String email);

    // Check if username exists
    boolean existsByUserName(String userName);
}