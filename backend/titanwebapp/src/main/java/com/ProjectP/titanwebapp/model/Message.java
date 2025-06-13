package com.ProjectP.titanwebapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
@Table(name = "broadcast_messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String senderUsername;

    public Message(String content, String senderUsername) {
        this.content = content;
        this.senderUsername = senderUsername;
        this.timestamp = LocalDateTime.now();
    }

    // Helper method for formatted timestamp display
    public String getFormattedTimestamp() {
        return timestamp.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));
    }
}