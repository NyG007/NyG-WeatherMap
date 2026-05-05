/* ============================================================
   SKYCHECK — app.js
   Created by NyG | Vanilla JS + Fetch API + OpenWeatherMap
   ============================================================ */


/* ── CONSTANTS ────────────────────────────────────────────── */
const BASE_URL  = "https://api.openweathermap.org/data/2.5/weather"; // OWM endpoint
const ICON_URL  = "https://openweathermap.org/img/wn";               // OWM icon CDN
const UNITS     = "metric";                                           // Celsius / m/s


/* ── DOM REFERENCES ───────────────────────────────────────── */
const searchForm      = document.getElementById("search-form");
const cityInput       = document.getElementById("city-input");
const searchError     = document.getElementById("search-error");
const weatherSection  = document.getElementById("weather-section");
const weatherSkeleton = document.getElementById("weather-skeleton");
const weatherCard     = document.getElementById("weather-card");

// Weather card fields
const elCity        = document.getElementById("weather-city");
const elCountry     = document.getElementById("weather-country");
const elTemp        = document.getElementById("weather-temp");
const elDescription = document.getElementById("weather-description");
const elIcon        = document.getElementById("weather-icon");
const elFeelsLike   = document.getElementById("weather-feels-like");
const elHumidity    = document.getElementById("weather-humidity");
const elWind        = document.getElementById("weather-wind");
const elPressure    = document.getElementById("weather-pressure");
const elUpdated     = document.getElementById("weather-updated");


/* ── UI STATE HELPERS ─────────────────────────────────────── */

function showSkeleton() {
  weatherSection.hidden  = false; // reveal section
  weatherSkeleton.hidden = false; // show shimmer
  weatherCard.hidden     = true;  // hide card
  clearError();
}

function showCard() {
  weatherSkeleton.hidden = true;  // hide shimmer
  weatherCard.hidden     = false; // reveal populated card
}

function hideWeather() {
  weatherSection.hidden  = true;
  weatherSkeleton.hidden = true;
  weatherCard.hidden     = true;
}

function showError(message) {
  searchError.textContent = message; // aria-live announces this automatically
  searchError.hidden      = false;
}

function clearError() {
  searchError.textContent = "";
  searchError.hidden      = true;
}


/* ── RENDER WEATHER ───────────────────────────────────────── */

/*
  renderWeather(data)
  -------------------
  Receives the raw OWM JSON object and populates every field in the card.

  OWM response shape used here:
    data.name              → city name
    data.sys.country       → ISO country code (e.g. "GB")
    data.main.temp         → temperature in °C (units=metric)
    data.main.feels_like   → feels-like temperature in °C
    data.main.humidity     → humidity percentage
    data.main.pressure     → atmospheric pressure in hPa
    data.weather[0].description → human-readable condition
    data.weather[0].icon   → icon code (e.g. "10d")
    data.wind.speed        → wind speed in m/s
*/
function renderWeather(data) {
  // Destructure the fields we need from the response
  const { name, sys, main, weather, wind } = data;

  // City and country
  elCity.textContent    = name;                        // e.g. "London"
  elCountry.textContent = sys.country;                 // e.g. "GB"

  // Temperature — Math.round removes decimal noise from OWM values
  elTemp.textContent        = `${Math.round(main.temp)}°C`;
  elFeelsLike.textContent   = `${Math.round(main.feels_like)}°C`;

  // Condition description — API returns lowercase, CSS capitalizes it
  elDescription.textContent = weather[0].description;

  // Weather icon — OWM provides a code; @2x gives the higher-res version
  elIcon.src = `${ICON_URL}/${weather[0].icon}@2x.png`;
  elIcon.alt = weather[0].description; // meaningful alt for screen readers

  // Detail grid fields
  elHumidity.textContent = `${main.humidity}%`;
  elPressure.textContent = `${main.pressure} hPa`;
  elWind.textContent     = `${Math.round(wind.speed * 3.6)} km/h`; // m/s → km/h

  // Last updated timestamp — derived from the user's local time
  elUpdated.textContent = `Updated at ${new Date().toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
  })}`;

  showCard(); // hide skeleton and reveal the populated card
}


/* ── FETCH WEATHER ────────────────────────────────────────── */

async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;

  const response = await fetch(url); // TypeError thrown here if offline

  if (response.status === 404) {
    throw new Error("City not found. Please check the spelling and try again.");
  }
  if (response.status === 401) {
    throw new Error("Invalid API key. Check your config.js file.");
  }
  if (!response.ok) {
    throw new Error(`Unexpected error: ${response.status}. Please try again.`);
  }

  const data = await response.json(); // parse JSON body
  return data;
}


/* ── FORM SUBMIT HANDLER ──────────────────────────────────── */

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showError("Please enter a city name.");
    cityInput.focus();
    return;
  }

  showSkeleton();

  try {
    const data = await fetchWeather(city); // fetch raw OWM data
    renderWeather(data);                   // populate and show the card
  } catch (error) {
    hideWeather();
    showError(error.message);
  }
});