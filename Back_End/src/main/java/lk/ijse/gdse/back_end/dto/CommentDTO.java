package lk.ijse.gdse.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CommentDTO {
    private Long commentId;
    private String commentText;
    private String username;
}
