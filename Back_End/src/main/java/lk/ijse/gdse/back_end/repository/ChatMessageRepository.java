package lk.ijse.gdse.back_end.repository;

import lk.ijse.gdse.back_end.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Fetch chat history between two users
    List<ChatMessage> findBySenderEmailAndReceiverEmailOrReceiverEmailAndSenderEmailOrderByTimestampAsc(
            String senderEmail1, String receiverEmail1,
            String senderEmail2, String receiverEmail2
    );
}
