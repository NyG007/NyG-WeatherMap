/* ============================================================
   SKYCHECK — app.js
   Created by NyG | Vanilla JS + Fetch API + OpenWeatherMap
   ============================================================ */


/* ── CONSTANTS ────────────────────────────────────────────── */
const BASE_URL  = "https://api.openweathermap.org/data/2.5/weather";
const ICON_URL  = "https://openweathermap.org/img/wn";
const UNITS     = "metric";


/* ── DOM REFERENCES ───────────────────────────────────────── */
const searchForm      = document.getElementById("search-form");
const cityInput       = document.getElementById("city-input");
const searchError     = document.getElementById("search-error");
const weatherSection  = document.getElementById("weather-section");
const weatherSkeleton = document.getElementById("weather-skeleton");
const weatherCard     = document.getElementById("weather-card");
const geoBtn          = document.getElementById("geo-btn");         // NEW

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


/* ── ICONS ────────────────────────────────────────────────── */

// SVG icons injected at runtime — no external icon library needed
const ICON_GEO = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
  <circle cx="12" cy="12" r="9" stroke-dasharray="2 3"/>
</svg>`;

const ICON_SPINNER = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"
  style="animation: spin 0.8s linear infinite;">
  <path d="M12 2a10 10 0 0 1 10 10"/>
</svg>`;

const ICON_SUN = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <circle cx="12" cy="12" r="5"/>
  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42
           M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
</svg>`;

const ICON_MOON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

// Add spin keyframe once to <head>
const spinStyle = document.createElement("style");
spinStyle.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(spinStyle);


/* ── THEME TOGGLE ─────────────────────────────────────────── */

const themeToggle = document.querySelector("[data-theme-toggle]");

// Initialise theme from system preference
let currentTheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
applyTheme(currentTheme);

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);           // update tokens
  themeToggle.innerHTML    = theme === "dark" ? ICON_SUN : ICON_MOON;   // swap icon
  themeToggle.setAttribute(                                              // update label
    "aria-label",
    `Switch to ${theme === "dark" ? "light" : "dark"} mode`
  );
}

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark"; // flip state
  applyTheme(currentTheme);
});


/* ── UI STATE HELPERS ─────────────────────────────────────── */

function showSkeleton() {
  weatherSection.hidden  = false;
  weatherSkeleton.hidden = false;
  weatherCard.hidden     = true;
  clearError();
}

function showCard() {
  weatherSkeleton.hidden = true;
  weatherCard.hidden     = false;
}

function hideWeather() {
  weatherSection.hidden  = true;
  weatherSkeleton.hidden = true;
  weatherCard.hidden     = true;
}

function showError(message) {
  searchError.textContent = message;
  searchError.hidden      = false;
}

function clearError() {
  searchError.textContent = "";
  searchError.hidden      = true;
}


/* ── GEO BUTTON STATE HELPERS ─────────────────────────────── */

function setGeoLoading(isLoading) {
  if (isLoading) {
    geoBtn.innerHTML         = ICON_SPINNER;                  // swap to spinner
    geoBtn.setAttribute("aria-label", "Detecting location…"); // update label
    geoBtn.disabled          = true;                          // block double-click
    geoBtn.classList.add("loading");
  } else {
    geoBtn.innerHTML         = ICON_GEO;                      // restore icon
    geoBtn.setAttribute("aria-label", "Use my current location");
    geoBtn.disabled          = false;
    geoBtn.classList.remove("loading");
  }
}

// Inject default geo icon on page load
geoBtn.innerHTML = ICON_GEO;


/* ── RENDER WEATHER ───────────────────────────────────────── */

function renderWeather(data) {
  const { name, sys, main, weather, wind } = data;

  elCity.textContent        = name;
  elCountry.textContent     = sys.country;
  elTemp.textContent        = `${Math.round(main.temp)}°C`;
  elFeelsLike.textContent   = `${Math.round(main.feels_like)}°C`;
  elDescription.textContent = weather[0].description;
  elIcon.src                = `${ICON_URL}/${weather[0].icon}@2x.png`;
  elIcon.alt                = weather[0].description;
  elHumidity.textContent    = `${main.humidity}%`;
  elPressure.textContent    = `${main.pressure} hPa`;
  elWind.textContent        = `${Math.round(wind.speed * 3.6)} km/h`;
  elUpdated.textContent     = `Updated at ${new Date().toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  })}`;

  showCard();
}


/* ── FETCH BY CITY NAME ───────────────────────────────────── */

async function fetchWeather(city) {
  const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${UNITS}`;
  const response = await fetch(url);

  if (response.status === 404) throw new Error("City not found. Please check the spelling and try again.");
  if (response.status === 401) throw new Error("Invalid API key. Check your config.js file.");
  if (!response.ok)            throw new Error(`Unexpected error: ${response.status}. Please try again.`);

  return response.json();
}


/* ── FETCH BY COORDINATES (Issues #19 + #20) ─────────────── */

/*
  fetchWeatherByCoords(lat, lon)
  ------------------------------
  Calls the same OWM endpoint using lat/lon instead of city name.
  The response shape is identical — renderWeather() reuses without changes.

  navigator.geolocation returns coordinates as decimal degrees:
    lat  — positive = North, negative = South
    lon  — positive = East,  negative = West
*/
async function fetchWeatherByCoords(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${UNITS}`;
  const response = await fetch(url);

  if (response.status === 401) throw new Error("Invalid API key. Check your config.js file.");
  if (!response.ok)            throw new Error(`Location lookup failed: ${response.status}. Please try again.`);

  return response.json();
}


/* ── GEOLOCATION HANDLER (Issues #19, #21, #22) ──────────── */

/*
  handleGeolocation()
  -------------------
  Triggers the browser's Geolocation API and fetches weather by coordinates.

  navigator.geolocation.getCurrentPosition() takes two callbacks:
    onSuccess(position) — called when the user grants permission
    onError(error)      — called when denied or unavailable

  GeolocationPositionError codes:
    1 — PERMISSION_DENIED     → user blocked location access
    2 — POSITION_UNAVAILABLE  → device cannot determine location
    3 — TIMEOUT               → took too long to respond
*/
function handleGeolocation() {
  // Guard: browser does not support Geolocation API
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser. Please search manually.");
    cityInput.focus(); // redirect user to manual search
    return;
  }

  setGeoLoading(true); // show spinner, disable button (Issue #22)
  showSkeleton();      // show loading card immediately

  navigator.geolocation.getCurrentPosition(
    // ── SUCCESS CALLBACK ──────────────────────────────────
    async (position) => {
      const { latitude, longitude } = position.coords; // extract decimal coordinates

      try {
        const data = await fetchWeatherByCoords(latitude, longitude); // Issue #20
        renderWeather(data);                                           // reuse same renderer
      } catch (error) {
        hideWeather();
        showError(error.message);
      } finally {
        setGeoLoading(false); // always restore button (Issue #22)
      }
    },

    // ── ERROR CALLBACK (Issue #21) ────────────────────────
    (error) => {
      hideWeather();
      setGeoLoading(false); // restore button regardless of error type

      // Map each error code to a user-friendly message
      const messages = {
        1: "Location access denied. Please search manually.",          // PERMISSION_DENIED
        2: "Your location could not be determined. Please search manually.", // POSITION_UNAVAILABLE
        3: "Location request timed out. Please search manually.",      // TIMEOUT
      };

      showError(messages[error.code] || "Unable to detect location. Please search manually.");
      cityInput.focus(); // redirect focus to manual search input (Issue #21)
    },

    // ── OPTIONS ───────────────────────────────────────────
    {
      timeout:            10000, // give up after 10 seconds
      maximumAge:         60000, // accept cached position up to 1 min old
      enableHighAccuracy: false, // low accuracy is enough for city-level weather
    }
  );
}

// Wire geo button to handler
geoBtn.addEventListener("click", handleGeolocation);


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
    const data = await fetchWeather(city);
    renderWeather(data);
  } catch (error) {
    hideWeather();
    showError(error.message);
  }
});