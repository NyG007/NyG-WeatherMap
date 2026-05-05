/* ============================================================
   SKYCHECK — app.js
   Created by NyG | Vanilla JS + Fetch API + OpenWeatherMap
   ============================================================ */


/* ── CONSTANTS ────────────────────────────────────────────── */
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"; // OWM endpoint
const UNITS    = "metric";                                           // Celsius


/* ── DOM REFERENCES ───────────────────────────────────────── */
const searchForm    = document.getElementById("search-form");
const cityInput     = document.getElementById("city-input");
const searchError   = document.getElementById("search-error");
const weatherSection = document.getElementById("weather-section");
const weatherSkeleton = document.getElementById("weather-skeleton");
const weatherCard   = document.getElementById("weather-card");


/* ── UI STATE HELPERS ─────────────────────────────────────── */

// Shows the skeleton loader and hides the card
function showSkeleton() {
  weatherSection.hidden   = false;  // reveal the section
  weatherSkeleton.hidden  = false;  // show shimmer
  weatherCard.hidden      = true;   // hide real card
  clearError();                     // dismiss any previous error
}

// Shows the weather card and hides the skeleton
function showCard() {
  weatherSkeleton.hidden = true;  // hide shimmer
  weatherCard.hidden     = false; // reveal card
}

// Hides both skeleton and card, collapses the section
function hideWeather() {
  weatherSection.hidden  = true;
  weatherSkeleton.hidden = true;
  weatherCard.hidden     = true;
}

// Displays an error message in the accessible error region
function showError(message) {
  searchError.textContent = message; // inject message text
  searchError.hidden      = false;   // make region visible (aria-live announces it)
}

// Clears and hides the error region
function clearError() {
  searchError.textContent = "";   // empty the message
  searchError.hidden      = true; // collapse the region
}


/* ── FETCH WEATHER ────────────────────────────────────────── */

/*
  fetchWeather(city)
  ------------------
  Async function that calls the OpenWeatherMap API for a given city name.

  Concepts used:
  • async/await  — pauses execution until the Promise resolves, keeping code readable
  • try/catch    — intercepts any thrown error (HTTP or network) in one place
  • fetch()      — browser-native HTTP client, returns a Promise<Response>
  • response.ok  — true if HTTP status is 200–299, false otherwise
*/
async function fetchWeather(city) {
  // Build the full request URL with query params
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;

  // fetch() throws a TypeError only on network failure (offline, DNS error)
  // HTTP error codes (404, 401) do NOT throw — we check response.ok manually
  const response = await fetch(url);

  // City not found — OWM returns 404 for unknown city names
  if (response.status === 404) {
    throw new Error("City not found. Please check the spelling and try again.");
  }

  // Invalid API key — OWM returns 401
  if (response.status === 401) {
    throw new Error("Invalid API key. Check your config.js file.");
  }

  // Any other non-ok status (500, 503, etc.)
  if (!response.ok) {
    throw new Error(`Unexpected error: ${response.status}. Please try again.`);
  }

  // Parse the JSON body — also a Promise, so we await it
  const data = await response.json();

  return data; // raw OWM weather object
}


/* ── FORM SUBMIT HANDLER ──────────────────────────────────── */

/*
  Wires the search form to fetchWeather().
  All DOM transitions (skeleton → card → error) are managed here.
*/
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // prevent full page reload on submit

  const city = cityInput.value.trim(); // remove accidental whitespace

  // Client-side validation — reject empty input before hitting the API
  if (!city) {
    showError("Please enter a city name.");
    cityInput.focus(); // return focus to input for immediate correction
    return;
  }

  showSkeleton(); // show loading state immediately

  try {
    const data = await fetchWeather(city); // await the API call
    console.log("Weather data received:", data); // temporary — removed in Issue #15
    showCard(); // placeholder until renderWeather() is implemented in Issue #15
  } catch (error) {
    // Catches: custom thrown errors above + TypeError (network failure)
    hideWeather();
    showError(error.message);
  }
});