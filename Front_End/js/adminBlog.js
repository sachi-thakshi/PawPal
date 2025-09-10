const jwtToken = localStorage.getItem("jwtToken"); // Admin JWT token

// --------------------- INIT ---------------------
function initBlogs() {
    const container = document.getElementById("blogsContainer");
    if (!container) return;

    // Upload button
    const uploadBtn = document.getElementById("uploadBlogBtn");
    if (uploadBtn) uploadBtn.addEventListener("click", uploadBlog);

    // Load blogs
    loadBlogs();
}

// --------------------- LOAD BLOGS ---------------------
async function loadBlogs() {
    const container = document.getElementById("blogsContainer");
    if (!container) return;

    try {
        const res = await fetch("http://localhost:8080/blog/all", {
            headers: { "Authorization": `Bearer ${jwtToken}` }
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const blogs = await res.json();

        container.innerHTML = blogs.map(blog => renderBlogCard(blog)).join('');

        // Attach event listeners dynamically
        blogs.forEach(blog => {
            const blogEl = document.getElementById(`blog-${blog.postId}`);
            if (!blogEl) return;

            blogEl.querySelector(".edit-post-btn")?.addEventListener("click", () => editPost(blog.postId));
            blogEl.querySelector(".delete-post-btn")?.addEventListener("click", () => deletePost(blog.postId));
            blogEl.querySelector(".add-comment-btn")?.addEventListener("click", () => addComment(blog.postId));

            blog.comments?.forEach(comment => {
                const commentEl = document.getElementById(`comment-${comment.commentId}`);
                if (!commentEl) return;

                commentEl.querySelector(".edit-comment-btn")?.addEventListener("click", () => editComment(blog.postId, comment.commentId));
                commentEl.querySelector(".delete-comment-btn")?.addEventListener("click", () => deleteComment(blog.postId, comment.commentId));
            });
        });

    } catch (error) {
        Swal.fire('Error', 'Failed to load blogs.', 'error');
        console.error(error);
    }
}

// --------------------- RENDER BLOG CARD ---------------------
function renderBlogCard(blog) {
    //console.log("Comments for blog", blog.postId, ":", blog.comments);

    const commentsHTML = blog.comments?.map(c => `
        <div class="comment" id="comment-${c.commentId}">
            <span class="comment-user">${c.username || c.user?.username || c.commenterName || c.userEmail || 'Unknown'}:</span>
            <span class="comment-text">${c.commentText}</span>
            <div class="comment-buttons">
                <button class="edit-comment-btn btn btn-sm btn-outline-primary">Edit</button>
                <button class="delete-comment-btn btn btn-sm btn-outline-danger">Delete</button>
            </div>
        </div>
    `).join('') || '';



    return `
        <div class="blog-card" id="blog-${blog.postId}">
            <div class="blog-header">
                <h3>${blog.title}</h3>
                    <small>By ${blog.authorName || blog.author?.username || blog.authorEmail || 'Unknown'} | ${new Date(blog.createdAt).toLocaleString()}</small>

            </div>
            <p class="blog-content">${blog.content}</p>
            ${blog.imageUrl ? `<img src="${blog.imageUrl}" class="blog-image">` : ''}
            <div class="blog-actions">
                <button class="edit-post-btn btn btn-sm btn-outline-primary">Edit Post</button>
                <button class="delete-post-btn btn btn-sm btn-outline-danger">Delete Post</button>
            </div>
            <div class="comments-section">
                ${commentsHTML}
                <div class="comment-input-container">
                    <input type="text" class="comment-input form-control form-control-sm" placeholder="Write a comment..." id="comment-input-${blog.postId}">
                    <button class="add-comment-btn btn btn-sm btn-success mt-1">Comment</button>
                </div>
            </div>
        </div>
    `;
}

// --------------------- CREATE POST ---------------------
async function uploadBlog() {
    const title = document.getElementById("blogTitle")?.value.trim();
    const content = document.getElementById("blogContent")?.value.trim();
    const image = document.getElementById("blogImage")?.files[0];

    if (!title || !content) {
        Swal.fire('Error', 'Title and Content are required!', 'error');
        return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
        const res = await fetch("http://localhost:8080/blog/create", {
            method: "POST",
            headers: { "Authorization": `Bearer ${jwtToken}` },
            body: formData
        });

        if (res.ok) {
            Swal.fire('Success', 'Blog uploaded successfully!', 'success');
            document.getElementById("blogTitle").value = '';
            document.getElementById("blogContent").value = '';
            document.getElementById("blogImage").value = '';
            loadBlogs();
        } else {
            Swal.fire('Error', 'Failed to upload blog.', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Unexpected error occurred.', 'error');
        console.error(error);
    }
}

// --------------------- ADD COMMENT ---------------------
async function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return Swal.fire('Error', 'Comment cannot be empty', 'error');

    try {
        const res = await fetch(`http://localhost:8080/blog/${postId}/comment`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ commentText: text })
        });

        if (res.ok) {
            Swal.fire('Success', 'Comment added!', 'success');
            input.value = '';
            loadBlogs();
        } else {
            Swal.fire('Error', 'Failed to add comment', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Unexpected error occurred', 'error');
        console.error(error);
    }
}

// --------------------- DELETE POST ---------------------
async function deletePost(postId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete the post!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`http://localhost:8080/blog/${postId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${jwtToken}` }
        });

        if (res.ok) {
            Swal.fire('Deleted!', 'Post has been deleted.', 'success');
            loadBlogs();
        } else {
            Swal.fire('Error', 'Failed to delete post', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Unexpected error occurred', 'error');
        console.error(error);
    }
}

// --------------------- DELETE COMMENT ---------------------
async function deleteComment(postId, commentId) {
    const result = await Swal.fire({
        title: 'Delete Comment?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`http://localhost:8080/blog/comment/${commentId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${jwtToken}` }
        });

        if (res.ok) {
            Swal.fire('Deleted!', 'Comment deleted.', 'success');
            loadBlogs();
        } else {
            Swal.fire('Error', 'Failed to delete comment', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Unexpected error occurred', 'error');
        console.error(error);
    }
}

// --------------------- EDIT POST ---------------------
async function editPost(postId) {
    const postEl = document.getElementById(`blog-${postId}`);
    if (!postEl) return;

    const currentTitle = postEl.querySelector('h3')?.innerText || '';
    const currentContent = postEl.querySelector('.blog-content')?.innerText || '';

    const { value: formValues } = await Swal.fire({
        title: 'Edit Post',
        html:
            `<input id="swal-title" class="swal2-input" placeholder="Title" value="${currentTitle}">` +
            `<textarea id="swal-content" class="swal2-textarea" placeholder="Content">${currentContent}</textarea>`,
        focusConfirm: false,
        showCancelButton: true,
        preConfirm: () => [
            document.getElementById('swal-title').value,
            document.getElementById('swal-content').value
        ]
    });

    if (!formValues) return;
    const [newTitle, newContent] = formValues;

    try {
        const res = await fetch(`http://localhost:8080/blog/${postId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: newTitle, content: newContent })
        });

        if (res.ok) {
            Swal.fire('Success', 'Post updated!', 'success');
            loadBlogs();
        } else {
            Swal.fire('Error', 'Failed to update post', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Unexpected error occurred', 'error');
        console.error(error);
    }
}

// --------------------- EDIT COMMENT ---------------------
async function editComment(postId, commentId) {
    const commentEl = document.getElementById(`comment-${commentId}`);
    if (!commentEl) return;

    const commentText = commentEl.querySelector('.comment-text')?.innerText || '';

    const { value: newText } = await Swal.fire({
        title: 'Edit Comment',
        input: 'textarea',
        inputValue: commentText,
        showCancelButton: true
    });

    if (!newText) return;

    try {
        const res = await fetch(`http://localhost:8080/blog/comment/${commentId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ commentText: newText })
        });

        if (res.ok) {
            Swal.fire('Success', 'Comment updated!', 'success');
            loadBlogs();
        } else {
            Swal.fire('Error', 'Failed to update comment', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Unexpected error occurred', 'error');
        console.error(error);
    }
}

// --------------------- RUN INIT ---------------------
window.addEventListener("DOMContentLoaded", initBlogs);
