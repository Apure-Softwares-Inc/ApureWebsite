document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const welcomeScreen = document.querySelector('.welcome-screen');
    const welcomeText = document.querySelector('.welcome-text');
    const panels = document.querySelectorAll('.panel');
    const blackScreen = document.querySelector('.black-screen');
    const luxuryBg = document.querySelector('.luxury-bg');
    const cubeContainer = document.querySelector('.cube-container');
    const cube = document.querySelector('.cube');
    const cuboidContainer = document.querySelector('.cuboid-container');
    const cuboid = document.querySelector('.cuboid');
    const nav = document.querySelector('.navbar');
    const content = document.querySelector('.content');
    
    
    // Animation state
    let animationPhase = 0;
    let targetXRotation = 0;
    let currentXRotation = 0;
    let isAnimating = false;
    let verticalRotationComplete = false;
    let allowContentScroll = false;
    const rotationSpeed = 0.5; // Increased rotation speed
    const maxVerticalRotation = 180;

    // 1. Welcome text animation
    function startWelcomeAnimation() {
        welcomeText.style.opacity = '1';
        
        setTimeout(() => {
            welcomeScreen.style.opacity = '0';
            setTimeout(() => {
                welcomeScreen.style.display = 'none';
                startRosePetalAnimation();
            }, 10);
        }, 4300);
    }

    // 2. Rose petal animation
    function startRosePetalAnimation() {
        blackScreen.style.opacity = '1';
        cubeContainer.style.opacity = '0.3';
        
        setTimeout(() => {
            document.querySelector('.top-left').style.transform = 'translate(-100%, -100%) rotate(-15deg)';
            document.querySelector('.top-right').style.transform = 'translate(100%, -100%) rotate(15deg)';
            document.querySelector('.bottom-left').style.transform = 'translate(-100%, 100%) rotate(15deg)';
            document.querySelector('.bottom-right').style.transform = 'translate(100%, 100%) rotate(-15deg)';

            luxuryBg.style.opacity = '1';
            cubeContainer.style.opacity = '1';

            setTimeout(() => {
                blackScreen.style.display = 'none';
                initialCubeRotation();
            }, 2500);
        }, 1200);
    }

    // 3. Initial cube rotation
    function initialCubeRotation() {
        let start = null;
        const duration = 2400;
        
        function rotateClockwise(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            const rotation = 360 * progress;
            cube.style.transform = `rotateY(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(rotateClockwise);
            } else {
                start = null;
                requestAnimationFrame(rotateCounterClockwise);
            }
        }
        
        function rotateCounterClockwise(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            const rotation = 360 - (360 * progress);
            cube.style.transform = `rotateY(${rotation}deg)`;
            
            if (progress < 1) {
                requestAnimationFrame(rotateCounterClockwise);
            } else {
                cube.style.transform = 'rotateY(0deg) rotateX(0deg)';
                animationPhase = 1;
                window.addEventListener('wheel', handleScroll);
                window.addEventListener('mousemove', handleMouseMove);
            }
        }
        
        requestAnimationFrame(rotateClockwise);
    }

    // 4. Handle scroll for vertical rotation
    function handleScroll(e) {
        if (isAnimating || animationPhase !== 1) return;
        
        e.preventDefault();
        
        // Faster vertical rotation
        targetXRotation += e.deltaY * rotationSpeed;
        targetXRotation = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, targetXRotation));
        
        animateCubeRotation();
        
        // Check if vertical rotation is complete
        if (Math.abs(targetXRotation) >= maxVerticalRotation) {
            verticalRotationComplete = true;
            completeAnimation();
        }
    }

    // 5. Animate cube rotation smoothly
    function animateCubeRotation() {
        if (isAnimating) return;
        isAnimating = true;
        
        const animateFrame = () => {
            currentXRotation += (targetXRotation - currentXRotation) * 0.2; // Faster interpolation
            
            cube.style.transform = `rotateY(0deg) rotateX(${currentXRotation}deg)`;
            
            if (Math.abs(currentXRotation - targetXRotation) > 0.5) {
                requestAnimationFrame(animateFrame);
            } else {
                isAnimating = false;
            }
        };
        
        requestAnimationFrame(animateFrame);
    }

    // 6. Handle mouse move for cube follow effect
    function handleMouseMove(e) {
        if (animationPhase !== 1) return;
        
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        
        cubeContainer.style.transform = `
            translateZ(-200px) 
            rotateY(${x * 15}deg) 
            rotateX(${currentXRotation - y * 10}deg)
        `;
    }

    // 7. Complete animation and enable content scroll
    function completeAnimation() {
        animationPhase = 2;
        
        // Show navigation
        nav.style.opacity = '1';
        nav.style.transform = 'translateY(0)';
        
        // Enable content scrolling
        allowContentScroll = true;
        document.body.style.overflow = 'auto';
        window.removeEventListener('wheel', handleScroll);
        
        // Make cube follow cursor
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;
            
            cubeContainer.style.transform = `
                translateZ(-200px) 
                rotateY(${x * 30}deg) 
                rotateX(${-y * 20}deg)
                scale(0.8)
            `;
        });

        // Normal page scrolling
        window.addEventListener('wheel', (e) => {
            if (!allowContentScroll) return;
            window.scrollBy({
                top: e.deltaY,
                behavior: 'smooth'
            });
        }, { passive: true });

        // Make cube follow touch movement
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
        // Normal page scrolling for touch devices
        window.addEventListener('touchmove', (e) => {
            if (!allowContentScroll) return;
            // Allow default touch scrolling behavior
        }, { passive: true });
    }

    function handleTouchMove(e) {
        if (animationPhase !== 2) return;
        
        const x = e.touches[0].clientX / window.innerWidth - 0.5;
        const y = e.touches[0].clientY / window.innerHeight - 0.5;
        
        cubeContainer.style.transform = `
            translateZ(-200px) 
            rotateY(${x * 30}deg) 
            rotateX(${-y * 20}deg)
            scale(0.8)
        `;
    }

    // Start the animation sequence
    setTimeout(startWelcomeAnimation, 500);

    // 8. Restart animations when scrolling to top
    let lastScrolPosition = window.scrollY;
    const scrolThreshold = 100; // How far down before considering it a "scroll down"

    function resetToCubeRotation() {
        // Reset only relevant animation states
        animationPhase = 1;
        targetXRotation = 0;
        currentXRotation = 0;
        isAnimating = false;
        verticalRotationComplete = false;
        allowContentScroll = false;
        isTouchRotating = false;

        // Reset cube to initial rotation state
        cube.style.transform = 'rotateY(0deg) rotateX(0deg)';

        // Remove existing event listeners to prevent duplicates
        window.removeEventListener('wheel', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        
        // Reset body overflow to prevent scrolling during animation
        document.body.style.overflow = 'hidden';
        
        // Start from cube rotation phase
        initialCubeRotation();
    }

    window.addEventListener("scroll", () => {
        const currentScrolPosition = window.scrollY;

        // Only trigger if we've scrolled up near the top after being further down
        if (currentScrolPosition < 100 && lastScrolPosition > scrolThreshold) {
            resetToCubeRotation();
        }
        lastScrolPosition = currentScrolPosition;
    });

    
    // Touch support for mobile
    let touchStartY = 0;
    let touchStartX = 0;
    let isTouchRotating = false;
    
    document.addEventListener('touchstart', (e) => {
        if (animationPhase !== 1) return;

        e.preventDefault();
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        isTouchRotating = true;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (!isTouchRotating || animationPhase !== 1) return;
        
        e.preventDefault();
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - touchStartY;
        
        // Rotate cube based on touch movement
        targetXRotation += deltaY * 0.5;
        targetXRotation = Math.max(-maxVerticalRotation, Math.min(maxVerticalRotation, targetXRotation));
        touchStartY = touchY;
        
        animateCubeRotation();
        
        // Check if vertical rotation is complete
        if (Math.abs(targetXRotation) >= maxVerticalRotation) {
            verticalRotationComplete = true;
            completeAnimation();
            isTouchRotating = false;
        }
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
        isTouchRotating = false;
        
        // If rotation was almost complete but not quite, snap to complete position
        if (animationPhase === 1 && Math.abs(targetXRotation) > maxVerticalRotation * 0.8) {
            targetXRotation = targetXRotation > 0 ? maxVerticalRotation : -maxVerticalRotation;
            verticalRotationComplete = true;
            completeAnimation();
        }
    });

        
    if (!allowContentScroll) {
        e.preventDefault();
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
            
        const deltaX = touchX - touchStartX;
        const deltaY = touchY - touchStartY;
            
        // Rotate cube based on touch movement
        targetXRotation += deltaY * 0.5;
        cube.style.transform = `rotateY(${deltaX * 0.5}deg) rotateX(${targetXRotation}deg)`;
            
        touchStartX = touchX;
        touchStartY = touchY;
    }

});



// Continuous Marquee Sliders
const swiper6 = new Swiper('.swiper6', {
    freeMode: true,
    loop: true,
    freeModeMomentum: false,
    speed: 6000,
    direction: 'horizontal',
    autoplay: {
        delay: 0,
        disableOnInteraction: false,
    },
    slidesPerView: 'auto',
    spaceBetween: 30,
    allowTouchMove: false,
    watchSlidesProgress: true,
    resistanceRatio: 0 // Disable bounce effect
});



document.addEventListener('DOMContentLoaded', function() {
    const mainCol = document.querySelector('#wat');
    const vertSwiperEl = document.querySelector('#vertical-swiper');
    const vertWrapper = vertSwiperEl.querySelector('.swiper-wrapper');
    
    // Function to fill vertical slider to match main content height
    function fillVerticalSlider() {
        var mainHeight = mainCol.offsetHeight;
        // Duplicate original slides until vertical content height >= main content height
        var originalSlides = Array.from(vertWrapper.children);
        var cloneIndex = 0;
        while (vertSwiperEl.scrollHeight < mainHeight && originalSlides.length > 0) {
        var cloneSlide = originalSlides[cloneIndex % originalSlides.length].cloneNode(true);
        vertWrapper.appendChild(cloneSlide);
        cloneIndex++;
        if (cloneIndex > 50) break; // safety break
        }
        // Set vertical slider height to match main content and hide overflow beyond it
        vertSwiperEl.style.height = mainHeight + 'px';
        vertSwiperEl.style.overflow = 'hidden';
    }
    
    // Fill vertical slider then initialize Swipers
    fillVerticalSlider();
    const verticalSwiper = new Swiper('#vertical-swiper', {
        direction: 'vertical',
        spaceBetween: 0,
        freeMode: true,
        loop: true,
        speed: 15000,
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        allowTouchMove: false
    });

    const swiper1 = new Swiper('.swiper1', {
        freeMode: true,
        loop: true,
        freeModeMomentum: false,
        speed: 6000,
        direction: 'horizontal',
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        spaceBetween: 50,
        allowTouchMove: false,
        watchSlidesProgress: true,
        resistanceRatio: 0 // Disable bounce effect
    });

    const swiper2 = new Swiper('.swiper2', {
        freeMode: true,
        loop: true,
        freeModeMomentum: false,
        speed: 6000,
        direction: 'horizontal',
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true 
        },
        slidesPerView: 'auto',
        spaceBetween: 50,
        allowTouchMove: false,
        watchSlidesProgress: true,
        resistanceRatio: 0 // Disable bounce effect
    });

    const swiper3 = new Swiper('.swiper3', {
        freeMode: true,
        loop: true,
        freeModeMomentum: false,
        speed: 6000,
        direction: 'horizontal',
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        spaceBetween: 50,
        allowTouchMove: false,
        watchSlidesProgress: true,
        resistanceRatio: 0 // Disable bounce effect
    });

    const swiper4 = new Swiper('.swiper4', {
        freeMode: true,
        loop: true,
        freeModeMomentum: false,
        speed: 6000,
        direction: 'horizontal',
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
            reverseDirection: true 
        },
        slidesPerView: 'auto',
        spaceBetween: 50,
        allowTouchMove: false,
        watchSlidesProgress: true,
        resistanceRatio: 0 // Disable bounce effect
    });

    const swiper5 = new Swiper('.swiper5', {
        freeMode: true,
        loop: true,
        freeModeMomentum: false,
        speed: 6000,
        direction: 'horizontal',
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        spaceBetween: 50,
        allowTouchMove: false,
        watchSlidesProgress: true,
        resistanceRatio: 0 // Disable bounce effect
    });

    const swiper6 = new Swiper('.swiper6', {
        freeMode: true,
        loop: true,
        freeModeMomentum: false,
        speed: 6000,
        direction: 'horizontal',
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        slidesPerView: 'auto',
        spaceBetween: 50,
        allowTouchMove: false,
        watchSlidesProgress: true,
        resistanceRatio: 0 // Disable bounce effect
    });
  
    // Recalculate vertical slider fill on window resize (for responsiveness)
    window.addEventListener('resize', fillVerticalSlider);
});




// Cuboid Idea Box Animation
const cuboidContainer = document.querySelector('.cuboid-container');
const cuboid = document.querySelector('.cuboid');
const tooltip = document.querySelector('.tooltip');
const modal = document.querySelector('.modal');
const modalOverlay = document.querySelector('.modal-overlay');
const ideaForm = document.getElementById('idea-form');
            
// Animation variables
let rotationAngle = 0;
let animationId = null;
const rotationSpeed = 1; // degrees per frame

// Function to continuously rotate the cuboid
function rotateCuboid() {
    rotationAngle += rotationSpeed;
    cuboid.style.transform = `rotateY(${rotationAngle}deg)`;
    animationId = requestAnimationFrame(rotateCuboid);
}

// Start the rotation when the page loads
rotateCuboid();
            
// Tooltip hover events
cuboidContainer.addEventListener('mouseenter', () => {
    tooltip.style.display = 'block';
    // Pause rotation on hover for better UX
    cancelAnimationFrame(animationId);
});
            
cuboidContainer.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
    // Resume rotation when mouse leaves
    rotateCuboid();
});
            
// Click event for modal
cuboidContainer.addEventListener('click', (e) => {
    e.stopPropagation();
    modal.style.display = 'block';
    modalOverlay.style.display = 'block';
    // Pause rotation when modal is open
    cancelAnimationFrame(animationId);
});
            
// Close modal when clicking outside
modalOverlay.addEventListener('click', () => {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
    // Resume rotation when modal closes
    rotateCuboid();
});
            
// Form submission handler
document.getElementById('idea-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    // Collect form data
    const formData = new URLSearchParams(new FormData(form));
    
    // Your Google Apps Script URL (from deployment)
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzEmk6ONOpkDEb-sIgWg6mF8jquNucuxtG17_y7TD5mIurby-jR9FJmnVjeNbagxKpS/exec';
    
    // Submit to Google Apps Script
    fetch(scriptUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (data.result === 'success') {
            // Success message
            alert(data.message);
            form.reset();
            
            // Close modal if needed
            const modal = document.querySelector('.modal');
            if (modal) modal.style.display = 'none';
            
            // Reset reCAPTCHA
            if (typeof grecaptcha !== 'undefined') {
                grecaptcha.reset();
            }
        } else {
            throw new Error(data.message || 'Submission failed');
        }
    })
    .catch(error => {
        alert('Error: ' + error.message);
        console.error('Submission error:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    });
              
    // Here you would typically send the form data to a server
    alert('Thank you for your idea! We\'ll get back to you soon.');
                
    // Reset form and close modal
    ideaForm.reset();
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
    // Resume rotation after form submission
    rotateCuboid();
});


// Clean up animation when page is hidden to save resources
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(animationId);
    } else {
        rotateCuboid();
    }
});


// Mobile navigation toggle
function toggleMenu() {
    const navbarCollapse = document.querySelector('.navbar-collapse');
    navbarCollapse.classList.toggle('open');
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbarCollapse.classList.remove('open');
        });
    });
}

// Handle form submission for mobile
document.querySelectorAll('#idea-form').forEach(form => {
    form.addEventListener('submit', function(e) {
        if (window.innerWidth < 768) {
            e.preventDefault();
            // Add mobile-specific form handling here
            alert('Thank you for your idea! We\'ll get back to you soon.');
            form.reset();
        }
    });
});

// Adjust cube size on resize
window.addEventListener('resize', function() {
    if (window.innerWidth < 768) {
        const cubeContainer = document.querySelector('.cube-container');
        const size = Math.min(window.innerWidth, window.innerHeight) * 0.7;
        cubeContainer.style.width = `${size}px`;
        cubeContainer.style.height = `${size}px`;
    }
});
