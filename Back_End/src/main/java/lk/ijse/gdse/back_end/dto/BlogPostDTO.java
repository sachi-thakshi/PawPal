package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BlogPostDTO {
    private Long postId;
    private String title;
    private String content;
    private String imageUrl;
    private String createdAt;
    private String authorName;
    private List<CommentDTO> comments;
}
