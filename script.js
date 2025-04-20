// script.js

// ——— Helper: update the header clock ———
function updateDateTime() {
  const now = new Date();
  const dateOpts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent =
    now.toLocaleDateString('en-US', dateOpts);

  const timeOpts = { hour: '2-digit', minute: '2-digit', hour12: false };
  document.getElementById('currentTime').textContent =
    now.toLocaleTimeString('en-US', timeOpts);
}

document.addEventListener('DOMContentLoaded', () => {
  // ——— 1) Header clock ———
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // ——— 2) Sub‑screen navigation ———
  const navButtons = document.querySelectorAll('[data-target]');
  const screens    = document.querySelectorAll('.sub-screen');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      screens.forEach(s => s.classList.add('hidden'));
      document.getElementById(btn.dataset.target).classList.remove('hidden');
    });
  });

  // ——— 3) Call family simulation ———
  function simulateCall(name) {
    alert(`Calling ${name}…`);
  }
  document.getElementById('callSon')?.addEventListener('click', () => simulateCall('Michael (Son)'));
  document.getElementById('callDaughter')?.addEventListener('click', () => simulateCall('Sarah (Daughter)'));
  document.querySelectorAll('.callFriendBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.closest('div').querySelector('.font-bold').textContent;
      simulateCall(name);
    });
  document.getElementById(`emergencyBtn`)?.addEventListener('click', () => simulateCall('Emegency Services'));
  });

  // ——— 4) Medicine buttons ———
  document.getElementById('morningPillBtn')?.addEventListener('click', function() {
    this.classList.replace('bg-green-500','bg-gray-400');
    this.textContent = 'Taken';
  });
  document.getElementById('eveningPillBtn')?.addEventListener('click', function() {
    this.classList.replace('bg-green-500','bg-gray-400');
    this.textContent = 'Taken';
  });

  // ——— 5) Meal Scanner ———
  const meals = {
    meal001: { name: 'Chicken Soup',    image: 'resources/meals/chicken-soup.jpg',    ingredients: ['Chicken breast','Carrots','Celery','Onions','Chicken broth'], calories: 320, protein: '25g', allergens: 'None' },
    meal002: { name: 'Fish & Potatoes',  image: 'resources/meals/fish-and-potatoes.png', ingredients: ['White fish','Potatoes','Lemon','Olive oil','Fresh herbs'], calories: 380, protein: '22g', allergens: 'Fish' },
    meal003: { name: 'Vegetable Lasagna',image: 'resources/meals/vegetable-lasagna.jpg',ingredients: ['Pasta sheets','Zucchini','Eggplant','Tomato sauce','Cheese'], calories: 420, protein: '18g', allergens: 'Wheat, Dairy' }
  };
  const scanQrBtn      = document.getElementById('scanQrBtn');
  const mealDetails    = document.getElementById('mealDetails');
  const mealImage      = document.getElementById('mealImage');
  const mealName       = document.getElementById('mealName');
  const mealCalories   = document.getElementById('mealCalories');
  const mealProtein    = document.getElementById('mealProtein');
  const mealAllergens  = document.getElementById('mealAllergens');
  const ingredientsList= document.getElementById('ingredientsList');

  scanQrBtn?.addEventListener('click', () => {
    scanQrBtn.querySelector('div').textContent = 'Scanning...';
    scanQrBtn.classList.add('opacity-50','cursor-not-allowed');
    setTimeout(() => {
      const keys = Object.keys(meals);
      const meal = meals[keys[Math.floor(Math.random()*keys.length)]];
      mealImage.src             = meal.image;
      mealName.textContent      = meal.name;
      mealCalories.textContent  = `Calories: ${meal.calories}`;
      mealProtein.textContent   = `Protein: ${meal.protein}`;
      mealAllergens.textContent = `Allergens: ${meal.allergens}`;
      ingredientsList.innerHTML  = '';
      meal.ingredients.forEach(i => {
        const li = document.createElement('li');
        li.textContent = i;
        ingredientsList.appendChild(li);
      });
      scanQrBtn.classList.add('hidden');
      mealDetails.classList.remove('hidden');
    }, 2000);
  });

  // ——— 6) Real‑time Weather + Location ———
  const weatherLoading     = document.getElementById('weatherLoading');
  const weatherLocation    = document.getElementById('weatherLocation');
  const weatherIcon        = document.getElementById('weatherIcon');
  const weatherDescription = document.getElementById('weatherDescription');
  const weatherTemp        = document.getElementById('weatherTemp');
  const weatherError       = document.getElementById('weatherError');
  const OPENWEATHER_KEY    = '6d3ad80f32ae07a071aeb542a0049d46';

  async function reverseGeocode(lat, lon) {
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const data = await resp.json();
      return data.address.city||data.address.town||data.address.village||data.address.county||'';
    } catch {
      return '';
    }
  }

  async function fetchWeather() {
    weatherLoading.classList.remove('hidden');
    weatherError.classList.add('hidden');
    weatherIcon.innerHTML          = '';
    weatherDescription.textContent = '';
    weatherTemp.textContent        = '';

    let lat = 31.7683, lon = 35.2137;
    if (navigator.geolocation) {
      try {
        const pos = await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
      } catch {}
    }

    const place = await reverseGeocode(lat, lon);
    weatherLocation.textContent = place ? `Location: ${place}` : '';

    try {
      const resp = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_KEY}`
      );
      if (!resp.ok) throw new Error(resp.statusText);
      const data = await resp.json();
      const icon = data.weather[0].icon;
      weatherIcon.innerHTML          = `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" class="mx-auto"/>`;
      weatherDescription.textContent = data.weather[0].description;
      weatherTemp.textContent        = `${Math.round(data.main.temp)}°C`;
    } catch(err) {
      weatherError.textContent = `Could not load weather: ${err.message}`;
      weatherError.classList.remove('hidden');
    } finally {
      weatherLoading.classList.add('hidden');
    }
  }
  document.querySelector('[data-target="weatherScreen"]')?.addEventListener('click', fetchWeather);

  // ——— 7) Settings Overlay & Sliders ———
  const settingsOverlay  = document.getElementById('settingsOverlay');
  const settingsBtn      = document.getElementById('settingsBtn');
  const settingsCloseBtn = document.getElementById('settingsCloseBtn');
  const textSizeSlider   = document.getElementById('textSizeSlider');
  const volumeSlider     = document.getElementById('volumeSlider');
  const speedSlider      = document.getElementById('speedSlider');

  settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
  settingsCloseBtn.addEventListener('click', () => settingsOverlay.classList.add('hidden'));

  function updateTextSize(val) {
    const size = val==1 ? '18px' : val==3 ? '26px' : '22px';
    document.documentElement.style.setProperty('--font-size-base', size);
  }
  textSizeSlider.addEventListener('input', () => updateTextSize(textSizeSlider.value));
  volumeSlider.addEventListener('input', () => window.speechVolume = volumeSlider.value/10);
  speedSlider.addEventListener('input', () => window.speechRate = 0.5 + (speedSlider.value-1)/10);
  updateTextSize(textSizeSlider.value);
});
