const rotatingText = document.getElementById("rotating-text");
const yearElement = document.getElementById("year");

const messages = [
  "Fast to deploy",
  "Easy to edit",
  "Ready for GitHub Pages",
  "Pure HTML, CSS and JS"
];

let currentIndex = 0;

function updateRotatingText() {
  if (!rotatingText) return;

  rotatingText.style.opacity = "0";

  setTimeout(() => {
    currentIndex = (currentIndex + 1) % messages.length;
    rotatingText.textContent = messages[currentIndex];
    rotatingText.style.opacity = "1";
  }, 180);
}

if (rotatingText) {
  rotatingText.style.transition = "opacity 0.18s ease";
  setInterval(updateRotatingText, 2200);
}

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}
