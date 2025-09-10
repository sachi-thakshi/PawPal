package lk.ijse.gdse.back_end.controller;

import lk.ijse.gdse.back_end.dto.BlogPostDTO;
import lk.ijse.gdse.back_end.dto.CommentDTO;
import lk.ijse.gdse.back_end.entity.BlogComment;
import lk.ijse.gdse.back_end.entity.BlogPost;
import lk.ijse.gdse.back_end.service.BlogService;
import lk.ijse.gdse.back_end.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin
@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final JwtUtil jwtUtil;

    private String validateAndGetEmail(String authHeader){
        if(authHeader == null || !authHeader.startsWith("Bearer "))
            throw new RuntimeException("Unauthorized: Missing token");
        String token = authHeader.substring(7);
        return jwtUtil.extractEmail(token);
    }

    // ---------------- CREATE POST ----------------
    @PostMapping("/create")
    public ResponseEntity<?> createBlog(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            String email = validateAndGetEmail(authHeader);
            BlogPost post = blogService.createBlogPost(title, content, image, email);
            BlogPostDTO dto = mapToDTO(post);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while creating blog: " + e.getMessage());
        }
    }

    // ---------------- GET ALL POSTS ----------------
    @GetMapping("/all")
    public ResponseEntity<List<BlogPostDTO>> getAllBlogs() {
        List<BlogPostDTO> dtos = blogService.getAllPosts().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // ---------------- ADD COMMENT ----------------
    @PostMapping("/{blogId}/comment")
    public ResponseEntity<CommentDTO> addComment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long blogId,
            @RequestBody Map<String, String> payload
    ) {
        String email = validateAndGetEmail(authHeader);
        String commentText = payload.get("commentText");
        BlogComment comment = blogService.addComment(blogId, email, commentText);
        return ResponseEntity.ok(new CommentDTO(
                comment.getCommentId(),
                comment.getCommentText(),
                comment.getUser().getUsername()
        ));
    }

    // ---------------- DELETE POST ----------------
    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long blogId) throws IOException {
        blogService.deletePost(blogId);
        return ResponseEntity.ok().build();
    }

    // ---------------- DELETE COMMENT ----------------
    @DeleteMapping("/comment/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        blogService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }

    // ---------------- EDIT POST ----------------
    @PutMapping("/{blogId}")
    public ResponseEntity<BlogPostDTO> editPost(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long blogId,
            @RequestBody Map<String, String> payload
    ) {
        String email = validateAndGetEmail(authHeader);
        String newTitle = payload.get("title");
        String newContent = payload.get("content");
        BlogPost updatedPost = blogService.editPost(blogId, email, newTitle, newContent);
        return ResponseEntity.ok(mapToDTO(updatedPost));
    }

    // ---------------- EDIT COMMENT ----------------
    @PutMapping("/comment/{commentId}")
    public ResponseEntity<CommentDTO> editComment(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long commentId,
            @RequestBody Map<String, String> payload
    ) {
        String email = validateAndGetEmail(authHeader);
        String newText = payload.get("commentText");
        BlogComment updatedComment = blogService.editComment(commentId, email, newText);
        return ResponseEntity.ok(new CommentDTO(
                updatedComment.getCommentId(),
                updatedComment.getCommentText(),
                updatedComment.getUser().getUsername()
        ));
    }

    // ---------------- Helper ----------------
    private BlogPostDTO mapToDTO(BlogPost post) {
        List<CommentDTO> comments = post.getComments() != null
                ? post.getComments().stream()
                .map(c -> new CommentDTO(
                        c.getCommentId(),
                        c.getCommentText(),
                        c.getUser() != null ? c.getUser().getUsername() : "Anonymous"
                ))
                .collect(Collectors.toList())
                : new ArrayList<>();

        return new BlogPostDTO(
                post.getPostId(),
                post.getTitle(),
                post.getContent(),
                post.getImageUrl(),
                post.getCreatedAt().toString(),
                post.getAuthor() != null ? post.getAuthor().getUsername() : "Unknown",
                comments
        );
    }
}
