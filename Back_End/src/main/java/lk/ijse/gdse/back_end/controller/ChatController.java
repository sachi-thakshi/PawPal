package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.entity.AdoptionRequest;
import lk.ijse.gdse.back_end.entity.ChatMessage;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.service.ChatService;
import lk.ijse.gdse.back_end.service.PetOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final PetOwnerService userService;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @RequestParam String user1,
            @RequestParam String user2
    ) {
        List<ChatMessage> messages = chatService.getChatHistory(user1, user2);

        messages.forEach(msg -> {
            if (msg.getSenderName() == null) {
                var user = userService.getPetOwnerByEmail(msg.getSenderEmail());
                if (user != null) {
                    msg.setSenderName(user.getUsername());
                }
            }
        });

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/save")
    public ResponseEntity<ChatMessage> saveMessage(@RequestBody ChatMessage message) {
        // Get sender info
        var sender = userService.getPetOwnerByEmail(message.getSenderEmail());
        if (sender != null) {
            message.setSenderName(sender.getUsername());
        }

        // Get receiver info
        var receiver = userService.getPetOwnerByEmail(message.getReceiverEmail());
        if (receiver != null) {
            message.setReceiverName(receiver.getUsername());
        }

        message.setTimestamp(LocalDateTime.now());
        ChatMessage saved = chatService.saveMessage(message);
        return ResponseEntity.ok(saved);
    }

}