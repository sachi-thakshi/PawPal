// // Smooth scrolling for navigation links
//         document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//             anchor.addEventListener('click', function (e) {
//                 e.preventDefault();
//                 const target = document.querySelector(this.getAttribute('href'));
//                 if (target) {
//                     target.scrollIntoView({
//                         behavior: 'smooth',
//                         block: 'start'
//                     });
//                 }
//             });
//         });

//         // Header background on scroll
//         window.addEventListener('scroll', () => {
//             const header = document.querySelector('.header');
//             if (window.scrollY > 100) {
//                 header.style.background = 'rgba(255, 255, 255, 0.98)';
//                 header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.15)';
//             } else {
//                 header.style.background = 'rgba(255, 255, 255, 0.95)';
//                 header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
//             }
//         });

//         // Add entrance animations when elements come into view
//         const observerOptions = {
//             threshold: 0.1,
//             rootMargin: '0px 0px -50px 0px'
//         };

//         const observer = new IntersectionObserver((entries) => {
//             entries.forEach(entry => {
//                 if (entry.isIntersecting) {
//                     entry.target.style.opacity = '1';
//                     entry.target.style.transform = 'translateY(0)';
//                 }
//             });
//         }, observerOptions);

//         // Observe service cards and stats
//         document.querySelectorAll('.service-card, .stat').forEach(el => {
//             el.style.opacity = '0';
//             el.style.transform = 'translateY(30px)';
//             el.style.transition = 'all 0.6s ease';
//             observer.observe(el);
//         });

//         // Interactive service cards
//         document.querySelectorAll('.service-card').forEach(card => {
//             card.addEventListener('mouseenter', function() {
//                 this.style.transform = 'translateY(-15px) scale(1.02)';
//             });
            
//             card.addEventListener('mouseleave', function() {
//                 this.style.transform = 'translateY(0) scale(1)';
//             });
//         });

//         // Button click effects
//         document.querySelectorAll('.btn, .btn-secondary').forEach(btn => {
//             btn.addEventListener('click', function(e) {
//                 let ripple = document.createElement('span');
//                 ripple.style.cssText = `
//                     position: absolute;
//                     border-radius: 50%;
//                     background: rgba(255, 255, 255, 0.6);
//                     transform: scale(0);
//                     animation: ripple 0.6s linear;
//                     pointer-events: none;
//                 `;
                
//                 let rect = this.getBoundingClientRect();
//                 let size = Math.max(rect.width, rect.height);
//                 ripple.style.width = ripple.style.height = size + 'px';
//                 ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
//                 ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
                
//                 this.appendChild(ripple);
                
//                 setTimeout(() => {
//                     ripple.remove();
//                 }, 600);
//             });
//         });

//         // Add ripple animation CSS
//         const style = document.createElement('style');
//         style.textContent = `
//             @keyframes ripple {
//                 to {
//                     transform: scale(4);
//                     opacity: 0;
//                 }
//             }
//             .btn, .btn-secondary {
//                 position: relative;
//                 overflow: hidden;
//             }
//         `;
//         document.head.appendChild(style);




