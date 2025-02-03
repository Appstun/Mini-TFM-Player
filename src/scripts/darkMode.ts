let darkModeEnabled = localStorage.getItem("window.darkMode")?.toLowerCase() === "true";

const darkModeElement = document.getElementById("window.style")! as HTMLLinkElement;
let iconDarkElement = document.getElementById("window.button.mode.dark");
let iconLightElement = document.getElementById("window.button.mode.light");

function checkDarkMode() {
  if (darkModeEnabled) {
    darkModeElement.href = "./styles/styleD.css";
    if (iconDarkElement) iconDarkElement.classList.add("invisible");
    if (iconLightElement) iconLightElement.classList.remove("invisible");
  } else {
    darkModeElement.href = "./styles/styleL.css";
    if (iconDarkElement) iconDarkElement.classList.remove("invisible");
    if (iconLightElement) iconLightElement.classList.add("invisible");
  }
}

function toggleDarkMode() {
  darkModeEnabled = !darkModeEnabled;
  localStorage.setItem("window.darkMode", `${darkModeEnabled}`);
  checkDarkMode();
}

function loadElement() {
  iconDarkElement = document.getElementById("window.button.mode.dark");
  iconLightElement = document.getElementById("window.button.mode.light");
}

function modeInit() {
  loadElement();
  checkDarkMode();
}

checkDarkMode();
