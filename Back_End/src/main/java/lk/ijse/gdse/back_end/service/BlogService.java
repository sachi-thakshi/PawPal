package lk.ijse.gdse.back_end.service;

import com.cloudinary.utils.ObjectUtils;
import lk.ijse.gdse.back_end.entity.BlogComment;
import lk.ijse.gdse.back_end.entity.BlogPost;
import lk.ijse.gdse.back_end.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BlogService {
    BlogPost createBlogPost(String title, String content, MultipartFile image, String authorEmail) throws IOException;
    List<BlogPost> getAllPosts();
    Optional<BlogPost> getPostById(Long postId);
    void deletePost(Long postId) throws IOException;
    BlogComment addComment(Long postId, String userEmail, String commentText);
    List<BlogComment> getCommentsForPost(Long postId);
    BlogPost editPost(Long postId, String authorEmail, String title, String content);
    BlogComment editComment(Long commentId, String userEmail, String commentText);
    void deleteComment(Long commentId);
}
