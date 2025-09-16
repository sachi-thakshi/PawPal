package lk.ijse.gdse.back_end.service;

import lk.ijse.gdse.back_end.entity.ChatMessage;

import java.util.List;

public interface ChatService {
    ChatMessage saveMessage(ChatMessage message);
    List<ChatMessage> getChatHistory(String user1, String user2);
}
