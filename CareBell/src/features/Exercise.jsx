import React, { useState, useEffect } from "react";
import { API } from "../shared/config";
import { useTranslation } from "react-i18next";
import { playTts } from "../shared/tts";

function Exercise() {
  const { t, i18n } = useTranslation();
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  // Fetch exercises when component mounts
  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => () => {
    if (audioObj) audioObj.pause();
  }, [audioObj]);

  // Filter exercises when filters change
  useEffect(() => {
    filterExercises();
  }, [exercises, selectedCategory, selectedDifficulty]);

  // Fetch exercises from API
  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Try HTTPS first, fallback to HTTP
      let res;
      try {
        res = await fetch(`${API}/exercises/elderly-friendly`);
      } catch (err) {
        console.log("HTTPS failed, trying HTTP");
        res = await fetch('http://carebell.online/exercises/elderly-friendly');
      }
      
      if (!res.ok) {
        throw new Error(`Failed to fetch exercises: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("Fetched exercises:", data);
      
      setExercises(data);
      setFilteredExercises(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError(`Could not load exercises: ${err.message}. Please check your server connection.`);
      setLoading(false);
    }
  };

  // Filter exercises based on selected criteria
  const filterExercises = () => {
    let filtered = exercises;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'All') {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }
    
    setFilteredExercises(filtered);
  };

  // Text-to-speech function
  const speakText = async (text, exerciseId) => {
    // Stop any ongoing speech
    stopSpeaking();

    if (!text) return;

    try {
      const lang = i18n.language.split('-')[0];
      const audio = await playTts(text, lang);
      setAudioObj(audio);
      setSpeaking(true);
      setCurrentSpeakingId(exerciseId);
      audio.onended = () => {
        setSpeaking(false);
        setCurrentSpeakingId(null);
        setAudioObj(null);
      };
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  // Stop speaking function
  const stopSpeaking = () => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
      setAudioObj(null);
    }
    setSpeaking(false);
    setCurrentSpeakingId(null);
  };

  // Create exercise description for speech
  const createExerciseDescription = (exercise) => {
    if (!exercise) return "";
    
    let description = `This is ${exercise.name}. `;
    description += `${exercise.description}. `;
    description += `This is a ${exercise.difficulty} exercise targeting ${exercise.targetAreas.join(", ")}. `;
    description += `It takes about ${exercise.duration} minutes. `;
    
    if (exercise.benefits && exercise.benefits.length > 0) {
      description += `Benefits include: ${exercise.benefits.join(", ")}. `;
    }
    
    return description;
  };

  // Get unique categories from exercises
  const categories = ['All', ...new Set(exercises.map(ex => ex.category))];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Sample exercises with GIF URLs
  const sampleExercisesData = [
    {
      guid: "elderly-exercise-001",
      name: "Wall Pushups",
      description: "Gentle pushups against a wall to strengthen chest and shoulders.",
      instructions: "1. Stand about 3 feet away from a wall, facing it with your feet shoulder-width apart\n2. Lean forward and place your hands flat on the wall, in line with your shoulders\n3. Your body should be in plank position, with your spine straight, not sagging or arched\n4. Lower your body toward the wall and then push back\n5. Repeat 10 times",
      difficulty: "Easy",
      targetAreas: ["Chest", "Shoulders", "Arms"],
      duration: 5,
      caloriesBurned: 20,
      reps: 10,
      sets: 1,
      equipment: ["Wall"],
      gifUrl: "https://i.pinimg.com/originals/46/bf/57/46bf5743497f7f39eb42b3ade9ee5236.gif",
      videoUrl: null,
      benefits: ["Strengthens upper body", "Improves posture", "Low impact on joints"],
      precautions: ["Use a stable wall", "Keep movements controlled", "Don't force movement"],
      modifications: ["Move closer to wall for easier version", "Start with fewer reps"],
      category: "Strength",
      elderlyFriendly: true
    },
    {
      guid: "elderly-exercise-002",
      name: "Seated Leg Extensions",
      description: "Gentle leg strengthening exercise done while sitting.",
      instructions: "1. Sit in a chair with back support\n2. Slowly extend one leg straight out\n3. Hold for 2-3 seconds\n4. Lower slowly\n5. Repeat with other leg",
      difficulty: "Easy",
      targetAreas: ["Quadriceps", "Knees"],
      duration: 4,
      caloriesBurned: 15,
      reps: 6,
      sets: 1,
      equipment: ["Chair"],
      gifUrl: "https://example.com/seated-leg-extensions.gif", // Replace with actual GIF
      videoUrl: null,
      benefits: ["Strengthens quadriceps", "Improves flexibility", "Low impact"],
      precautions: ["Don't lock knee completely", "Slow controlled movements"],
      modifications: ["Reduce range of motion", "Add ankle weights for challenge"],
      category: "Strength",
      elderlyFriendly: true
    },
    {
      guid: "elderly-exercise-003",
      name: "Neck Rolls",
      description: "Gentle neck movement to relieve stiffness.",
      instructions: "1. Sit or stand comfortably\n2. Slowly turn head to look right\n3. Then forward, left, back\n4. Repeat in opposite direction\n5. Do 4 complete rotations",
      difficulty: "Easy",
      targetAreas: ["Neck", "Shoulders"],
      duration: 2,
      caloriesBurned: 5,
      reps: 4,
      sets: 1,
      equipment: ["None"],
      gifUrl: "https://example.com/neck-rolls.gif", // Replace with actual GIF
      videoUrl: null,
      benefits: ["Reduces stiffness", "Improves neck mobility", "Relieves tension"],
      precautions: ["Move slowly", "Stop if dizzy", "Don't force movements"],
      modifications: ["Limit range of motion", "Do seated only"],
      category: "Flexibility",
      elderlyFriendly: true
    }
  ];

  // Handle populate database
  const populateDatabase = async () => {
    try {
      setLoading(true);
      
      const res = await fetch(`${API}/exercises/populate-sample`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ exercises: sampleExercisesData })
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(`Success! Added ${data.exercises.length} exercises to the database.`);
        fetchExercises(); // Refresh the list
      } else {
        throw new Error('Failed to populate exercises');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error adding exercises. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-6xl mx-auto bg-white dark:bg-gray-900 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-800 dark:text-blue-200">
        {t("Exercise.Library")}
      </h1>
      
      {/* Add exercises button if database is empty */}
      {exercises.length === 0 && !loading && (
        <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-600 rounded-lg">
          <h2 className="text-lg font-bold mb-2 text-yellow-800 dark:text-yellow-200">{t("Exercise.no_exercises_label")}</h2>
          <p className="text-yellow-700 dark:text-yellow-100 mb-3 text-sm">{t("Exercise.no_exercises")}
          </p>
          <button
            onClick={populateDatabase}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            {t("Exercise.add_exercises")}
          </button>
        </div>
      )}
      
      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold mb-1 dark:text-white">{t("Exercise.Category")} </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 text-sm border-2 border-gray-300 dark:border-yellow-600 dark:bg-gray-800 dark:text-white rounded-lg focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1 dark:text-white">{t("Exercise.difficulty")}</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full p-2 text-sm border-2 border-gray-300 dark:border-yellow-600 dark:bg-gray-800 dark:text-white rounded-lg focus:border-blue-500"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-600 text-red-700 dark:text-red-100 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-bold text-lg mb-2">{t("Exercise.Error")}</h3>
          <p>{error}</p>
          <button 
            onClick={fetchExercises}
            className="mt-3 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("Exercise.Try_Again")}
          </button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {t("Exercise.no_exercises_criteria")}
          </p>
          {selectedDifficulty === 'Hard' && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-yellow-500 rounded-lg p-4 mt-3 max-w-md mx-auto">
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                {t("Exercise.Hard_label")}
              </p>
              <button
                onClick={() => setSelectedDifficulty('Medium')}
                className="mt-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("Exercise.showMedium")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Exercise List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExercises.map((exercise) => (
              <div 
                key={exercise._id} 
                className={`border border-gray-200 dark:border-yellow-600 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
                  currentSpeakingId === exercise._id ? "border-2 border-yellow-500" : ""
                }`}
              >

                <div className="relative">
                  {/* Show GIF in the exercise card */}
                  <img 
                    src={
                      exercise.gifUrl
                        ? `${API}${exercise.gifUrl}`            // prepend backend origin
                        : "https://via.placeholder.com/400x300?text=Exercise+GIF"
                    } 
                    alt={exercise.name} 
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x300?text=Exercise+GIF";
                    }}
                  />
                  
                  <div className="absolute top-1 right-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      exercise.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                      exercise.difficulty === 'Medium' ? 'bg-yellow-500 text-black' :
                      'bg-red-500 text-white'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
                
                <div className="p-3">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{exercise.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    <span className="font-medium">{t("Exercise.Category")}</span> {exercise.category} | 
                    <span className="font-medium"> {t("Exercise.duration")}</span> {exercise.duration} min
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 mb-3 line-clamp-2">{exercise.description}</p>
                  
                  <div className="mb-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{t("Exercise.target_areas")} </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.targetAreas.map((area, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 px-2 py-1 rounded">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => setSelectedExercise(exercise)}
                      className="flex-1 px-2 py-1 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("Exercise.view_details")}
                    </button>
                    
                    {currentSpeakingId === exercise._id && speaking ? (
                      <button
                        onClick={stopSpeaking}
                        className="flex-1 sm:flex-none sm:w-auto px-2 py-1 bg-yellow-500 text-white text-sm font-semibold rounded-lg"
                      >
                        <span className="mr-1 text-sm">🔇</span>{t("Exercise.stop")}
                      </button>
                    ) : (
                      <button
                        onClick={() => speakText(createExerciseDescription(exercise), exercise._id)}
                        className="flex-1 sm:flex-1 sm:w-15 px-2 py-1 bg-green-600 text-white text-sm font-semibold rounded-lg"
                      >
                        <span className="mr-1 text-sm">🔊</span>{t("Exercise.read")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedExercise.name}</h2>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold dark:text-white"
                >
                  ×
                </button>
              </div>
              
              {/* Display only GIF (same as the main card) */}
              {selectedExercise.gifUrl && (
                <div className="mb-4">
                  <div className="relative">
                    <img 
                      src={`${API}${selectedExercise.gifUrl}`}
                      alt={`${selectedExercise.name} Exercise Animation`} 
                      className="w-full rounded-lg"
                      onError={(e) => {
                        console.error('GIF failed to load:', selectedExercise.gifUrl);
                        e.target.parentNode.innerHTML = `
                          <div class="bg-gray-100 p-4 rounded-lg text-center">
                            <p class="text-gray-500 text-sm">Exercise animation not available</p>
                            <p class="text-xs text-gray-400 mt-2">The exercise GIF could not be loaded.</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("Exercise.descriptionLabel")}</h3>
                  <p className="text-sm text-gray-700 dark:text-white">{selectedExercise.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold mb-2">{t("Exercise.instructionsLabel")}</h3>
                  <div className="text-sm text-gray-700 whitespace-pre-line dark:text-white">{selectedExercise.instructions}</div>
                </div>
                
                {selectedExercise.benefits && selectedExercise.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-2">{t("Exercise.benefitsLabel")}</h3>
                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-white">
                      {selectedExercise.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedExercise.precautions && selectedExercise.precautions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-red-600">{t("Exercise.precautionsLabel")}</h3>
                    <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-600">
                      {selectedExercise.precautions.map((precaution, idx) => (
                        <li key={idx}>{precaution}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedExercise.modifications && selectedExercise.modifications.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-green-600 dark:text-green-500">{t("Exercise.modificationsLabel")}</h3>
                    <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-500">
                      {selectedExercise.modifications.map((modification, idx) => (
                        <li key={idx}>{modification}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-3 pt-3 border-t dark:border-yellow-300">
                  <button
                    onClick={() => speakText(createExerciseDescription(selectedExercise), selectedExercise._id)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-1">🔊</span>{t("Exercise.readInstructions")}
                  </button>
                  
                  {selectedExercise.videoUrl && (
                    <a
                      href={selectedExercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <span className="mr-1">▶️</span>{t("Exercise.watchVideo")}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Exercise;