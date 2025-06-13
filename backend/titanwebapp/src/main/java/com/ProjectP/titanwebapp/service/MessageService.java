package com.ProjectP.titanwebapp.service;

import com.ProjectP.titanwebapp.model.Message;
import com.ProjectP.titanwebapp.repo.MessageRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepo repo;

    public Message saveMessage(String content, String senderUsername) {
        Message message = new Message(content, senderUsername);
        message.setTimestamp(LocalDateTime.now());
        return repo.save(message);
    }

    public List<Message> getAllMessages() {
        return repo.findAllByOrderByTimestampDesc();
    }

    public List<Message> getMessagesBySender(String senderUsername) {
        return repo.findBySenderUsernameOrderByTimestampDesc(senderUsername);
    }
}
