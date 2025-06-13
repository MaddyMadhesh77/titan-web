package com.ProjectP.titanwebapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

@Entity
@Component
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Accounts")
@Builder
public class CreateAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    private String name;
    private String role;
    private String email;
    private String password;
    private String userName;
}
