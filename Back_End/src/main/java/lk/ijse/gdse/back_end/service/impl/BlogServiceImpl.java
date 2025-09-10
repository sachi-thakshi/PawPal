package lk.ijse.gdse.back_end.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lk.ijse.gdse.back_end.entity.BlogComment;
import lk.ijse.gdse.back_end.entity.BlogPost;
import lk.ijse.gdse.back_end.entity.User;
import lk.ijse.gdse.back_end.repository.BlogCommentRepository;
import lk.ijse.gdse.back_end.repository.BlogPostRepository;
import lk.ijse.gdse.back_end.repository.UserRepository;
import lk.ijse.gdse.back_end.service.BlogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    private final BlogPostRepository blogPostRepository;
    private final BlogCommentRepository blogCommentRepository;
    private final UserRepository userRepository;
    private final Cloudinary cloudinary;

    @Override
    public BlogPost createBlogPost(String title, String content, MultipartFile image, String authorEmail) throws IOException {
        User author = userRepository.findByEmail(authorEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = null;
        String imagePublicId = null;

        if (image != null && !image.isEmpty()) {
            var uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.emptyMap());
            imageUrl = (String) uploadResult.get("secure_url");
            imagePublicId = (String) uploadResult.get("public_id");
        }

        BlogPost post = BlogPost.builder()
                .title(title)
                .content(content)
                .imageUrl(imageUrl)
                .publicId(imagePublicId)
                .author(author)
                .createdAt(LocalDateTime.now())
                .build();

        return blogPostRepository.save(post);
    }


    @Override
    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    @Override
    public Optional<BlogPost> getPostById(Long postId) {
        return blogPostRepository.findById(postId);
    }

    @Override
    public void deletePost(Long postId) throws IOException {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        if (post.getPublicId() != null) {
            cloudinary.uploader().destroy(post.getPublicId(), ObjectUtils.emptyMap());
        }
        blogPostRepository.delete(post);
    }

    @Override
    public BlogComment addComment(Long postId, String userEmail, String commentText) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BlogComment comment = BlogComment.builder()
                .post(post)
                .user(user)
                .commentText(commentText)
                .createdAt(LocalDateTime.now())
                .build();

        return blogCommentRepository.save(comment);
    }

    @Override
    public List<BlogComment> getCommentsForPost(Long postId) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return blogCommentRepository.findByPost(post);
    }

    @Override
    public BlogPost editPost(Long postId, String authorEmail, String title, String content) {
        BlogPost post = blogPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if(!post.getAuthor().getEmail().equals(authorEmail)) {
            throw new RuntimeException("Unauthorized: Only author can edit");
        }

        post.setTitle(title);
        post.setContent(content);
        return blogPostRepository.save(post);
    }

    @Override
    public BlogComment editComment(Long commentId, String userEmail, String commentText) {
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if(!comment.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized: Only comment owner can edit");
        }

        comment.setCommentText(commentText);
        return blogCommentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long commentId) {
        BlogComment comment = blogCommentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        blogCommentRepository.delete(comment);
    }
}
