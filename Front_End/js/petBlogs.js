document.addEventListener('DOMContentLoaded', () => {
  loadBlogs();
});

async function loadBlogs() {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    Swal.fire('Error', "No JWT token found. Please login first.", 'error');
    return;
  }

  try {
    const response = await fetch('http://localhost:8080/blog/all', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const blogs = await response.json();
    renderBlogs(blogs, token);
  } catch (error) {
    console.error("Error loading blogs:", error);
    document.getElementById('blog-container').innerHTML =
        `<div class="alert alert-danger">Failed to load blogs.</div>`;
    Swal.fire('Error', "Failed to load blogs.", 'error');
  }
}

function renderBlogs(blogs, token) {
  const container = document.getElementById('blog-container');
  container.innerHTML = '';

  blogs.forEach(blog => {
    const blogDiv = document.createElement('div');
    blogDiv.classList.add('blog-post', 'mb-4', 'p-3', 'border', 'rounded');
    blogDiv.innerHTML = `
            <h3>${blog.title}</h3>
            <p><strong>Author:</strong> ${blog.authorName}</p>
            <p>${blog.content}</p>
            ${blog.imageUrl ? `<img src="${blog.imageUrl}" class="img-fluid mb-3"/>` : ''}
            <div class="comments mb-2">
                <h5>Comments:</h5>
                <ul class="list-group" id="comments-list-${blog.postId}">
                    ${blog.comments.map(c => renderCommentItem(blog.postId, c)).join('')}
                </ul>
            </div>
            <form class="comment-form" data-blog-id="${blog.postId}">
                <div class="mb-2">
                    <textarea class="form-control" rows="2" placeholder="Add a comment" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Comment</button>
            </form>
        `;

    container.appendChild(blogDiv);

    // Handle comment submission
    const form = blogDiv.querySelector('.comment-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const textarea = form.querySelector('textarea');
      const commentText = textarea.value.trim();
      if (!commentText) return;

      try {
        const blogId = form.getAttribute('data-blog-id');
        const res = await fetch(`http://localhost:8080/blog/${blogId}/comment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ commentText })
        });

        if (!res.ok) throw new Error(`Failed to post comment: ${res.status}`);

        const newComment = await res.json();
        const commentList = document.getElementById(`comments-list-${blogId}`);
        commentList.innerHTML += renderCommentItem(blogId, newComment);

        // Clear textarea
        textarea.value = '';
        attachCommentActions(blogId, newComment, token);

        Swal.fire('Success', 'Comment posted successfully!', 'success');

      } catch (err) {
        console.error("Error posting comment:", err);
        Swal.fire('Error', 'Failed to post comment.', 'error');
      }
    });

    // Attach edit/delete for existing comments
    blog.comments.forEach(c => attachCommentActions(blog.postId, c, token));
  });
}

function renderCommentItem(blogId, comment) {
  const username = comment.username || 'Unknown';
  const commentedClass = 'commented';
  return `
    <li class="list-group-item d-flex justify-content-between align-items-start ${commentedClass}" id="comment-${comment.commentId}">
      <span>${username}: ${comment.commentText}</span>
      ${isCurrentUser(username) ? `
        <div>
          <button class="btn btn-sm btn-secondary me-1 edit-comment-btn" data-comment-id="${comment.commentId}" data-blog-id="${blogId}">Edit</button>
          <button class="btn btn-sm btn-danger delete-comment-btn" data-comment-id="${comment.commentId}" data-blog-id="${blogId}">Delete</button>
        </div>
      ` : ''}
    </li>
  `;
}

function isCurrentUser(commentUsername) {
  const currentUser = localStorage.getItem('username');
  return currentUser && currentUser === commentUsername;
}

function attachCommentActions(blogId, comment, token) {
  const editBtn = document.querySelector(`#comment-${comment.commentId} .edit-comment-btn`);
  const deleteBtn = document.querySelector(`#comment-${comment.commentId} .delete-comment-btn`);

  if (editBtn) {
    editBtn.addEventListener('click', async () => {
      const { value: newText } = await Swal.fire({
        title: 'Edit your comment',
        input: 'textarea',
        inputValue: comment.commentText,
        showCancelButton: true
      });

      if (!newText) return;

      try {
        const res = await fetch(`http://localhost:8080/blog/comment/${comment.commentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ commentText: newText })
        });

        if (!res.ok) throw new Error("Failed to edit comment");
        comment.commentText = newText;
        document.querySelector(`#comment-${comment.commentId} span`).textContent = `${comment.username}: ${newText}`;
        Swal.fire('Success', 'Comment edited successfully!', 'success');
      } catch (err) {
        console.error("Error editing comment:", err);
        Swal.fire('Error', 'Failed to edit comment.', 'error');
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) return;

      try {
        const res = await fetch(`http://localhost:8080/blog/comment/${comment.commentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to delete comment");
        document.getElementById(`comment-${comment.commentId}`).remove();
        Swal.fire('Deleted!', 'Comment has been deleted.', 'success');
      } catch (err) {
        console.error("Error deleting comment:", err);
        Swal.fire('Error', 'Failed to delete comment.', 'error');
      }
    });
  }
}
