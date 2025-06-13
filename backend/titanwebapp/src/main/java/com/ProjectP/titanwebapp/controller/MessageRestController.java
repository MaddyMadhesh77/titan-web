package com.ProjectP.titanwebapp.controller;

import com.ProjectP.titanwebapp.model.Message;
import com.ProjectP.titanwebapp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        maxAge = 3600)
public class MessageRestController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/all")
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    @PostMapping("/upload")
    public Message createMessage(@RequestBody MessageRequest request) {
        return messageService.saveMessage(request.getContent(), request.getSenderUsername());
    }

    @GetMapping("/user/{username}")
    public List<Message> getMessagesByUser(@PathVariable String username) {
        return messageService.getMessagesBySender(username);
    }

    // Inner class for request body
    public static class MessageRequest {
        private String content;
        private String senderUsername;

        // Default constructor
        public MessageRequest() {}

        public MessageRequest(String content, String senderUsername) {
            this.content = content;
            this.senderUsername = senderUsername;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public String getSenderUsername() {
            return senderUsername;
        }

        public void setSenderUsername(String senderUsername) {
            this.senderUsername = senderUsername;
        }
    }
}