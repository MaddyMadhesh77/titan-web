package com.ProjectP.titanwebapp.controller;

import com.ProjectP.titanwebapp.model.Message;
import com.ProjectP.titanwebapp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import java.util.List;

@Controller
@RequestMapping("/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"},
        allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
        maxAge = 3600)
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/all")
    public String showMessages(Model model) {
        List<Message> messages = messageService.getAllMessages();
        model.addAttribute("messages", messages);
        model.addAttribute("newMessage", new Message());
        return "messages";
    }

    @PostMapping("/upload")
    public String sendMessage(@RequestParam String content,
                              @RequestParam String senderUsername,
                              RedirectAttributes redirectAttributes) {
        try {
            messageService.saveMessage(content, senderUsername);
            redirectAttributes.addFlashAttribute("success", "Message sent successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Failed to send message: " + e.getMessage());
        }
        return "redirect:/messages";
    }

    @GetMapping("/user/{username}")
    public String getMessagesByUser(@PathVariable String username, Model model) {
        List<Message> messages = messageService.getMessagesBySender(username);
        model.addAttribute("messages", messages);
        model.addAttribute("username", username);
        return "user-messages";
    }
}