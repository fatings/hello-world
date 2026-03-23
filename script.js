const rotatingText = document.getElementById("rotating-text");
const yearElement = document.getElementById("year");

const messages = [
  "Projetos estaticos",
  "Apps prontas a abrir",
  "Portfolio com demos",
  "HTML, CSS e JS"
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
