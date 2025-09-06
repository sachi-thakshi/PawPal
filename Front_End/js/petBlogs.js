// Simulate user data
  const user = {
    name: "Alex", // fallback name
    avatarUrl: null // or provide URL like "/images/alex.jpg"
  };

  const avatarContainer = document.getElementById("user-avatar");

  if (user.avatarUrl) {
    // Create <img> tag if avatar exists
    const img = document.createElement("img");
    img.src = user.avatarUrl;
    img.alt = "User Avatar";
    img.className = "rounded-circle";
    img.width = 36;
    img.height = 36;
    avatarContainer.innerHTML = '';
    avatarContainer.appendChild(img);
  } else {
    // Show first initial
    const initial = user.name ? user.name.charAt(0) : "?";
    avatarContainer.textContent = initial;
}

document.addEventListener('DOMContentLoaded', () => {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const blogPosts = document.querySelectorAll('.blog-post');

  // Category filter
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Set active button style
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-category');
      blogPosts.forEach(post => {
        if (category === 'all' || post.getAttribute('data-category') === category) {
          post.style.display = 'block';
        } else {
          post.style.display = 'none';
        }
      });
    });
  });

  // Handle comments submission and display
  const commentsData = {}; // store comments in-memory by blog ID

  document.querySelectorAll('.comment-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const blogId = form.getAttribute('data-blog-id');
      const textarea = form.querySelector('textarea');
      const commentText = textarea.value.trim();

      if (!commentText) return;

      if (!commentsData[blogId]) {
        commentsData[blogId] = [];
      }

      // Add comment to data
      commentsData[blogId].push(commentText);

      // Update comment list UI
      const commentList = document.getElementById(`comments-list-${blogId}`);
      const newComment = document.createElement('li');
      newComment.classList.add('list-group-item');
      newComment.textContent = commentText;
      commentList.appendChild(newComment);

      // Clear textarea
      textarea.value = '';
    });
  });
});

document.querySelectorAll('.category-btn').forEach(button => {
  button.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    const category = button.getAttribute('data-category');
    document.querySelectorAll('.blog-post').forEach(post => {
      if(category === 'all' || post.getAttribute('data-category') === category) {
        post.style.display = 'block';
      } else {
        post.style.display = 'none';
      }
    });
  });
});