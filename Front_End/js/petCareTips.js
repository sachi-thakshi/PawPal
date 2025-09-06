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

// Wait for DOM load
  document.addEventListener('DOMContentLoaded', () => {
    // Select all comment forms
    const commentForms = document.querySelectorAll('.comment-form');

    commentForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const tipId = form.getAttribute('data-tip-id');
        const textarea = form.querySelector('textarea');
        const commentText = textarea.value.trim();

        if (!commentText) {
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Comment cannot be empty.'
          });
          return;
        }

        // Append comment to list
        const commentList = document.getElementById(`comments-list-${tipId}`);
        const newCommentItem = document.createElement('li');
        newCommentItem.className = 'list-group-item';
        newCommentItem.textContent = commentText;
        commentList.appendChild(newCommentItem);

        // Clear textarea
        textarea.value = '';

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Thank you!',
          text: 'Your comment has been submitted.'
        });
      });
    });
  });