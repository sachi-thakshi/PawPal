package lk.ijse.gdse.back_end.config;

import lk.ijse.gdse.back_end.entity.ChatMessage;
import lk.ijse.gdse.back_end.service.ChatService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.*;
import org.springframework.web.socket.config.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatService chatService;

    public WebSocketConfig(ChatService chatService) {
        this.chatService = chatService;
    }

    private static final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new ChatHandler(chatService), "/chat")
                .setAllowedOriginPatterns("*");
    }

    private static class ChatHandler implements WebSocketHandler {

        private final ChatService chatService;

        public ChatHandler(ChatService chatService) {
            this.chatService = chatService;
        }

        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            String query = session.getUri().getQuery();
            if (query != null && query.startsWith("email=")) {
                String email = query.substring(6);
                sessions.put(email, session);
                System.out.println("✅ Connected: " + email);
            }
        }

        @Override
        public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
            String payload = message.getPayload().toString();
            String[] parts = payload.split("::", 2);

            if (parts.length == 2) {
                String targetEmail = parts[0];
                String msgBody = parts[1];

                // Save message to DB
                String senderEmail = sessions.entrySet().stream()
                        .filter(entry -> entry.getValue().equals(session))
                        .map(Map.Entry::getKey)
                        .findFirst()
                        .orElse("unknown");

                ChatMessage chatMessage = ChatMessage.builder()
                        .senderEmail(senderEmail)
                        .receiverEmail(targetEmail)
                        .message(msgBody)
                        .timestamp(LocalDateTime.now())
                        .build();

                chatService.saveMessage(chatMessage);

                // Send to receiver if connected
                WebSocketSession targetSession = sessions.get(targetEmail);
                if (targetSession != null && targetSession.isOpen()) {
                    targetSession.sendMessage(new TextMessage(msgBody));
                } else {
                    System.out.println("❌ User not connected: " + targetEmail);
                }
            }
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
            session.close(CloseStatus.SERVER_ERROR);
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
            sessions.entrySet().removeIf(entry -> entry.getValue().equals(session));
        }

        @Override
        public boolean supportsPartialMessages() {
            return false;
        }
    }
}
