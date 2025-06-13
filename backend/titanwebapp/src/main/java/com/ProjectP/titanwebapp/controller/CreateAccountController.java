package com.ProjectP.titanwebapp.controller;

import com.ProjectP.titanwebapp.model.CreateAccount;
import com.ProjectP.titanwebapp.service.CreateAccountService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        maxAge = 3600)
public class CreateAccountController {

    @Autowired
    private CreateAccountService accountService;

    // Signup endpoint
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody SignupRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            CreateAccount newAccount = accountService.saveAccount(
                    request.getName(),
                    request.getRole(), // Note: your React component uses 'lastname'
                    request.getUsername(),
                    request.getEmail(),
                    request.getPassword()
            );

            response.put("success", true);
            response.put("message", "Account created successfully");
            response.put("user", Map.of(
                    "id", newAccount.getId(),
                    "name", newAccount.getName(),
                    "role", newAccount.getRole(),
                    "username", newAccount.getUserName(),
                    "email", newAccount.getEmail()
            ));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred during signup");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            CreateAccount user = accountService.authenticateUser(
                    request.getEmailOrUsername(),
                    request.getPassword()
            );

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "role", user.getRole(),
                    "username", user.getUserName(),
                    "email", user.getEmail()
            ));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred during login");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Request DTOs
    @AllArgsConstructor
    @Getter
    @Setter
    @NoArgsConstructor
    public static class SignupRequest {
        private String name;
        private String role; // Match your React component
        private String username;
        private String email;
        private String password;
        private String confirmPassword;
    }

    public static class LoginRequest {
        private String emailOrUsername;
        private String password;

        // Getters and setters
        public String getEmailOrUsername() { return emailOrUsername; }
        public void setEmailOrUsername(String emailOrUsername) { this.emailOrUsername = emailOrUsername; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}