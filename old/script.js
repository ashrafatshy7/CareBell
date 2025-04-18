document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', options);
    
    // Get DOM elements - screens
    const mainScreen = document.getElementById('mainScreen');
    const chatScreen = document.getElementById('chatScreen');
    const callScreen = document.getElementById('callScreen');
    const medicineScreen = document.getElementById('medicineScreen');
    const weatherScreen = document.getElementById('weatherScreen');
    const mealScreen = document.getElementById('mealScreen');
    const friendsScreen = document.getElementById('friendsScreen');
    const settingsScreen = document.getElementById('settingsScreen');
    
    // Get DOM elements - buttons
    const talkBtn = document.getElementById('talkBtn');
    const callBtn = document.getElementById('callBtn');
    const medicineBtn = document.getElementById('medicineBtn');
    const weatherBtn = document.getElementById('weatherBtn');
    const mealBtn = document.getElementById('mealBtn');
    const friendsBtn = document.getElementById('friendsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    
    // Get DOM elements - back buttons
    const chatBackBtn = document.getElementById('chatBackBtn');
    const callBackBtn = document.getElementById('callBackBtn');
    const medicineBackBtn = document.getElementById('medicineBackBtn');
    const weatherBackBtn = document.getElementById('weatherBackBtn');
    const mealBackBtn = document.getElementById('mealBackBtn');
    const friendsBackBtn = document.getElementById('friendsBackBtn');
    const settingsBackBtn = document.getElementById('settingsBackBtn');
    
    // Get DOM elements - other UI elements
    const messages = document.getElementById('messages');
    const micBtn = document.getElementById('micBtn');
    const scanQrBtn = document.getElementById('scanQrBtn');
    const mealDetails = document.getElementById('mealDetails');
    const toastNotification = document.getElementById('toastNotification');
    
    // Get DOM elements - medicine buttons
    const morningPillBtn = document.getElementById('morningPillBtn');
    const eveningPillBtn = document.getElementById('eveningPillBtn');
    
    // Get DOM elements - sliders
    const textSizeSlider = document.getElementById('textSizeSlider');
    const volumeSlider = document.getElementById('volumeSlider');
    const speedSlider = document.getElementById('speedSlider');
    
    // Get all friend call buttons
    const callFriendBtns = document.querySelectorAll('.callFriendBtn');
    
    // Get all event join buttons
    const joinEventBtns = document.querySelectorAll('.joinEventBtn');
    
    // Fake data for the application
    const bellaResponses = {
        greeting: "Hello! I'm Bella, your CareBell assistant. How can I help you today?",
        weather: "It's a beautiful sunny day with 18°C outside. Perfect for a short walk in the garden!",
        medicine: "You have two pills to take today. One with breakfast and one at 6:00 PM.",
        family: "Would you like to call Michael or Sarah?",
        meal: "Your lunch today is chicken soup. It will be delivered at 12:30.",
        friends: "You have 4 friends online. Would you like to join the virtual chess club today?",
        general: [
            "I'm here to help you with anything you need!",
            "How are you feeling today?",
            "Would you like me to remind you about your appointments?",
            "Don't forget to drink plenty of water today.",
            "Your family asked me to remind you they love you very much!"
        ]
    };
    
    // Meal database (simulated)
    const meals = {
        "meal001": {
            name: "Chicken Soup",
            image: "/api/placeholder/400/200",
            ingredients: ["Chicken breast", "Carrots", "Celery", "Onions", "Chicken broth"],
            calories: 320,
            protein: "25g",
            allergens: "None"
        },
        "meal002": {
            name: "Fish with Potatoes",
            image: "/api/placeholder/400/200",
            ingredients: ["White fish", "Potatoes", "Lemon", "Olive oil", "Fresh herbs"],
            calories: 380,
            protein: "22g",
            allergens: "Fish"
        },
        "meal003": {
            name: "Vegetable Lasagna",
            image: "/api/placeholder/400/200",
            ingredients: ["Pasta sheets", "Zucchini", "Eggplant", "Tomato sauce", "Cheese"],
            calories: 420,
            protein: "18g",
            allergens: "Wheat, Dairy"
        }
    };
    
    // User questions database
    const userQuestions = [
        "What's the weather like today?",
        "Do I need to take medicine today?",
        "Can I call my family?",
        "What's for lunch today?",
        "Are my friends online?",
        "What time is it?",
        "When is my doctor appointment?",
        "What day is today?",
        "Tell me a joke",
        "Can you remind me to take my medicine?"
    ];
    
    // Settings for speech synthesis
    let speechVolume = 0.7; // 0 to 1
    let speechRate = 0.8;   // 0.1 to 2
    
    // Function to show a specific screen
    function showScreen(screen) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => s.style.display = 'none');
        
        // Show selected screen
        screen.style.display = 'flex';
    }
    
    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('p-4', 'rounded-xl', 'mb-3', 'max-w-xs');
        
        if (sender === 'bella') {
            messageDiv.classList.add('bg-gray-200', 'self-start');
        } else {
            messageDiv.classList.add('bg-purple-600', 'text-white', 'ml-auto');
        }
        
        messageDiv.textContent = text;
        messages.appendChild(messageDiv);
        messages.scrollTop = messages.scrollHeight;
        
        // If it's Bella's message, speak it
        if (sender === 'bella' && 'speechSynthesis' in window) {
            speakText(text);
        }
    }
    
    // Function to speak text using speech synthesis
    function speakText(text) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Create a new speech synthesis utterance
        const speech = new SpeechSynthesisUtterance(text);
        
        // Set speech parameters
        speech.volume = speechVolume;
        speech.rate = speechRate;
        speech.lang = 'en-US';
        
        // Speak the text
        window.speechSynthesis.speak(speech);
    }
    
    // Function to update text size
    function updateTextSize(size) {
        // size is 1, 2, or 3
        const rootElement = document.documentElement;
        let fontSize;
        
        switch(parseInt(size)) {
            case 1: // Small
                fontSize = '18px';
                break;
            case 2: // Medium (default)
                fontSize = '22px';
                break;
            case 3: // Large
                fontSize = '26px';
                break;
            default:
                fontSize = '22px';
        }
        
        // Update the CSS variable
        rootElement.style.setProperty('--font-size-base', fontSize);
    }
    
    // Function to display meal information after QR scan
    function displayMealInfo(mealId) {
        // Get meal data (in real app, this would come from scanning the QR code)
        const meal = meals[mealId];
        
        if (meal) {
            // Update meal details
            document.getElementById('mealName').textContent = meal.name;
            document.querySelector('#mealDetails img').src = meal.image;
            document.getElementById('mealCalories').textContent = meal.calories;
            document.getElementById('mealProtein').textContent = meal.protein;
            document.getElementById('mealAllergens').textContent = meal.allergens;
            
            // Update ingredients list
            const ingredientsList = document.getElementById('ingredientsList');
            ingredientsList.innerHTML = '';
            meal.ingredients.forEach(ingredient => {
                const li = document.createElement('li');
                li.classList.add('mb-2');
                li.textContent = ingredient;
                ingredientsList.appendChild(li);
            });
            
            // Show meal details, hide scanner
            scanQrBtn.style.display = 'none';
            mealDetails.style.display = 'block';
            
            // Speak meal information
            const mealInfoText = `This is ${meal.name}. It contains ${meal.ingredients.join(', ')}. It has ${meal.calories} calories.`;
            speakText(mealInfoText);
        }
    }
    
    // Function to show toast notification
    function showToast(message, duration = 3000) {
        // Set message and show toast
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        
        // Hide toast after duration
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, duration);
    }
    
    // Function to simulate a call
    function simulateCall(contactName) {
        // Create calling overlay
        const callOverlay = document.createElement('div');
        callOverlay.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center text-white';
        
        // Create contact avatar
        const avatar = document.createElement('div');
        avatar.className = 'w-32 h-32 rounded-full bg-purple-600 mb-5 call-animation';
        
        // Create calling text
        const callingText = document.createElement('div');
        callingText.textContent = `Calling ${contactName}...`;
        callingText.className = 'text-2xl mb-10';
        
        // Create end call button
        const endCallBtn = document.createElement('button');
        endCallBtn.textContent = 'End Call';
        endCallBtn.className = 'bg-red-500 text-white border-0 py-3 px-8 rounded-full text-lg cursor-pointer';
        
        // Add event listener to end call button
        endCallBtn.addEventListener('click', function() {
            document.body.removeChild(callOverlay);
        });
        
        // Add elements to the overlay
        callOverlay.appendChild(avatar);
        callOverlay.appendChild(callingText);
        callOverlay.appendChild(endCallBtn);
        
        // Add overlay to the body
        document.body.appendChild(callOverlay);
        
        // Auto end call after 10 seconds (simulating no answer)
        setTimeout(() => {
            if (document.body.contains(callOverlay)) {
                document.body.removeChild(callOverlay);
                showToast(`${contactName} didn't answer the call.`);
            }
        }, 10000);
    }
    
    // Function to handle joining an event
    function joinEvent(eventName) {
        // Create event overlay
        const eventOverlay = document.createElement('div');
        eventOverlay.className = 'fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center text-white';
        
        // Create event icon
        const eventIcon = document.createElement('div');
        eventIcon.className = 'text-6xl mb-5';
        eventIcon.innerHTML = '<i class="fas fa-users"></i>';
        
        // Create event text
        const eventText = document.createElement('div');
        eventText.textContent = `Joining ${eventName}...`;
        eventText.className = 'text-2xl mb-3';
        
        // Create participants text
        const participantsText = document.createElement('div');
        participantsText.textContent = '3 participants are waiting for you';
        participantsText.className = 'text-lg mb-10';
        
        // Create leave button
        const leaveBtn = document.createElement('button');
        leaveBtn.textContent = 'Leave Event';
        leaveBtn.className = 'bg-red-500 text-white border-0 py-3 px-8 rounded-full text-lg cursor-pointer';
        
        // Add event listener to leave button
        leaveBtn.addEventListener('click', function() {
            document.body.removeChild(eventOverlay);
        });
        
        // Add elements to the overlay
        eventOverlay.appendChild(eventIcon);
        eventOverlay.appendChild(eventText);
        eventOverlay.appendChild(participantsText);
        eventOverlay.appendChild(leaveBtn);
        
        // Add overlay to the body
        document.body.appendChild(eventOverlay);
    }
    
    // Event Listeners - Main menu buttons
    talkBtn.addEventListener('click', function() {
        showScreen(chatScreen);
        // Clear previous messages
        messages.innerHTML = '';
        // Add initial greeting
        addMessage(bellaResponses.greeting, 'bella');
    });
    
    callBtn.addEventListener('click', function() {
        showScreen(callScreen);
    });
    
    medicineBtn.addEventListener('click', function() {
        showScreen(medicineScreen);
    });
    
    weatherBtn.addEventListener('click', function() {
        showScreen(weatherScreen);
    });
    
    mealBtn.addEventListener('click', function() {
        showScreen(mealScreen);
        // Reset meal screen to scanner view when opened
        scanQrBtn.style.display = 'flex';
        mealDetails.style.display = 'none';
    });
    
    friendsBtn.addEventListener('click', function() {
        showScreen(friendsScreen);
    });
    
    settingsBtn.addEventListener('click', function() {
        showScreen(settingsScreen);
    });
    
    // Event Listeners - Back buttons
    chatBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
        // Stop any ongoing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    });
    
    callBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
    });
    
    medicineBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
    });
    
    weatherBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
    });
    
    mealBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
        // Stop any ongoing speech
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    });
    
    friendsBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
    });
    
    settingsBackBtn.addEventListener('click', function() {
        showScreen(mainScreen);
    });
    
    // Event Listener - Microphone button
    micBtn.addEventListener('click', function() {
        // In a real app, this would activate speech recognition
        // For demo, simulate user asking a random question
        const randomIndex = Math.floor(Math.random() * userQuestions.length);
        const randomQuestion = userQuestions[randomIndex];
        
        // Add user question
        addMessage(randomQuestion, 'user');
        
        // Determine which response to use based on the question
        let response;
        if (randomQuestion.includes('weather')) {
            response = bellaResponses.weather;
        } else if (randomQuestion.includes('medicine')) {
            response = bellaResponses.medicine;
        } else if (randomQuestion.includes('family') || randomQuestion.includes('call')) {
            response = bellaResponses.family;
        } else if (randomQuestion.includes('lunch') || randomQuestion.includes('meal') || randomQuestion.includes('food')) {
            response = bellaResponses.meal;
        } else if (randomQuestion.includes('friends') || randomQuestion.includes('online')) {
            response = bellaResponses.friends;
        } else {
            // Use a random general response
            const generalIndex = Math.floor(Math.random() * bellaResponses.general.length);
            response = bellaResponses.general[generalIndex];
        }
        
        // Simulate Bella's response with a delay
        setTimeout(function() {
            addMessage(response, 'bella');
        }, 1000);
    });
    
    // Event Listener - QR code scan button
    scanQrBtn.addEventListener('click', function() {
        // In a real app, this would activate the camera to scan a QR code
        // For demo purposes, simulate a successful scan after a delay
        const scanningText = scanQrBtn.querySelector('div');
        if (scanningText) {
            scanningText.textContent = "Scanning...";
        }
        
        // Randomly select one of the meals
        const mealKeys = Object.keys(meals);
        const randomMealId = mealKeys[Math.floor(Math.random() * mealKeys.length)];
        
        setTimeout(function() {
            displayMealInfo(randomMealId);
        }, 2000);
    });
    
    // Event Listeners for call screen contact buttons
    document.getElementById('callSon').addEventListener('click', function() {
        simulateCall("Michael (Son)");
    });
    
    document.getElementById('callDaughter').addEventListener('click', function() {
        simulateCall("Sarah (Daughter)");
    });
    
    document.getElementById('callFriend').addEventListener('click', function() {
        simulateCall("Robert (Friend)");
    });
    
    // Event Listeners for medicine buttons
    if (morningPillBtn) {
        morningPillBtn.addEventListener('click', function() {
            this.classList.add('bg-gray-400');
            this.textContent = 'Taken';
            this.disabled = true;
            showToast("Morning pill marked as taken.", 2000);
        });
    }
    
    if (eveningPillBtn) {
        eveningPillBtn.addEventListener('click', function() {
            this.classList.add('bg-gray-400');
            this.textContent = 'Taken';
            this.disabled = true;
            showToast("Evening pill marked as taken.", 2000);
        });
    }
    
    // Add event listeners to all friend call buttons
    callFriendBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const friendName = this.closest('div').querySelector('.font-bold').textContent;
            simulateCall(friendName);
        });
    });
    
    // Add event listeners to all event join buttons
    joinEventBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const eventName = this.closest('div').querySelector('.font-bold').textContent;
            joinEvent(eventName);
        });
    });
    
    // Event Listeners - Settings sliders
    textSizeSlider.addEventListener('input', function() {
        updateTextSize(this.value);
    });
    
    volumeSlider.addEventListener('input', function() {
        speechVolume = parseInt(this.value) / 10;
    });
    
    speedSlider.addEventListener('input', function() {
        // Convert 1-10 to 0.5-1.5 range for speech rate
        speechRate = 0.5 + (parseInt(this.value) - 1) / 10;
    });
    
    // Initialize toast notification element if it doesn't exist
    if (!toastNotification) {
        const toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white py-3 px-6 rounded-lg opacity-0 transition-opacity duration-300';
        toast.style.zIndex = '9999';
        document.body.appendChild(toast);
    }
    
    // Initialize settings
    updateTextSize(textSizeSlider.value);
    
    // Fix for elements that might not exist in the HTML
    // This makes the script more robust
    const callFriendButtons = document.querySelectorAll('#friendsScreen .bg-green-500');
    callFriendButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const friendName = this.closest('div').querySelector('.font-bold').textContent;
            simulateCall(friendName);
        });
    });
    
    const joinEventButtons = document.querySelectorAll('#friendsScreen .border-b .font-bold');
    joinEventButtons.forEach(eventDiv => {
        eventDiv.parentElement.addEventListener('click', function() {
            const eventName = eventDiv.textContent;
            joinEvent(eventName);
        });
    });
    
    // Get medicine buttons by their container instead
    const medicinePills = document.querySelectorAll('#medicineScreen .bg-green-500');
    medicinePills.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const pillName = index === 0 ? "Morning pill" : "Evening pill";
            this.classList.remove('bg-green-500');
            this.classList.add('bg-gray-400');
            this.textContent = 'Taken';
            this.disabled = true;
            showToast(`${pillName} marked as taken.`, 2000);
        });
    });
});
