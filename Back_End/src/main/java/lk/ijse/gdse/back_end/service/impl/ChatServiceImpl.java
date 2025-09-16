package lk.ijse.gdse.back_end.service.impl;

import lk.ijse.gdse.back_end.entity.ChatMessage;
import lk.ijse.gdse.back_end.repository.ChatMessageRepository;
import lk.ijse.gdse.back_end.service.ChatService;
import lk.ijse.gdse.back_end.service.PetOwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatMessageRepository repository;
    private final PetOwnerService userService;

    @Override
    public ChatMessage saveMessage(ChatMessage message) {
        return repository.save(message);
    }

    @Override
    public List<ChatMessage> getChatHistory(String user1, String user2) {
        return repository.findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
                user1, user2, user1, user2
        );
    }
}
