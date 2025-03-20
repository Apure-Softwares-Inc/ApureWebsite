// Harmburger Menu
function toggleMenu() {
    const navbarCollapse = document.getElementById("navbarNav");
    navbarCollapse.classList.toggle("open");
}



// Hero Section Animation
const textElement = document.querySelector(".animated-text");
const cursor = document.querySelector(".cursor");

const texts = [
    "a senior product designer",
    "a software engineer",
    "a tech startup co-founder",
    "a user researcher",
    "a lead scientist",
    "an instructor",
    "a Ph.D. nerd",
    "an anime fan",
    "a senior product designer"
];

let index = 0;
let charIndex = 0;
let isDeleting = false;
let speed = 100; // Typing speed
let isCompleted = false; // Track if the animation is done

function typeEffect() {
    if (isCompleted) return; // Stop if the animation has completed

    const currentText = texts[index];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    textElement.innerText = currentText.substring(0, charIndex);

    if (!isDeleting && charIndex === currentText.length) {
        setTimeout(() => isDeleting = true, 1000); // Pause before deleting
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        index++;

        // Stop when we reach the last "A frontend developer" after full cycle
        if (index === texts.length) {
            isCompleted = true;
            textElement.innerText = texts[texts.length - 1]; // Ensure final text remains
            cursor.style.display = "none"; // Hide cursor after completion
            return;
        }
    }

    setTimeout(typeEffect, isDeleting ? 50 : speed);
}

// Start animation when page loads
window.onload = typeEffect;

// Restart animation when user scrolls to top
window.addEventListener("scroll", () => {
    if (window.scrollY === 0 && isCompleted) {
        index = 0;
        charIndex = 0;
        isDeleting = false;
        isCompleted = false;
        cursor.style.display = "inline"; // Show cursor again
        typeEffect();
    }
});



// Project button Animation

// Function to handle tab switching

function openTab(tabName) {
    // Hide all tab content
    const tabContents = document.querySelectorAll(".tabcontent");
    tabContents.forEach((tab) => (tab.style.display = "none"));

    // Remove the "active" class from all buttons
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((button) => button.classList.remove("active"));
  
    // Show the selected tab content
    document.getElementById(tabName).style.display = "block";

    // Add the "active" class to the clicked button
    const activeButton = document.querySelector(`[onclick="openTab('${tabName}')"]`);
    activeButton.classList.add("active");
}
  
// Show the first tab by default
document.addEventListener("DOMContentLoaded", () => {
    openTab("tab1");
});