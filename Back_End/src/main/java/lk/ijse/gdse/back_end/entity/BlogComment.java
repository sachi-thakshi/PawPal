package lk.ijse.gdse.back_end.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BlogComment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @ManyToOne
    @JoinColumn(name = "blog_id")
    @JsonBackReference
    private BlogPost post;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String commentText;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
