import React, { useState, useEffect } from "react";
import { API } from "../config";
function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);

  // Fetch today's news when component mounts
  useEffect(() => {
    fetchTodaysNews();
    
    // Set up event listener for speech synthesis voices
    if (window.speechSynthesis) {
      // Sometimes voices aren't loaded immediately, so we need to handle that
      let voicesLoaded = false;
      
      const loadVoices = () => {
        // Get the list of voices
        const voices = window.speechSynthesis.getVoices();
        
        if (voices.length > 0) {
          voicesLoaded = true;
          console.log("Speech voices loaded:", voices.length);
          
          // Log available German voices for debugging
          const germanVoices = voices.filter(voice => voice.lang.startsWith('de'));
          console.log("Available German voices:", germanVoices.map(v => `${v.name} (${v.lang})`));
        }
      };
      
      // Load voices right away
      loadVoices();
      
      // And also set up an event listener for when voices change/load
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // If voices haven't loaded after 1 second, try again
      if (!voicesLoaded) {
        setTimeout(loadVoices, 1000);
      }
    }
    
    // Clean up function to stop any ongoing speech when component unmounts
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      }
    };
  }, []);

  // Fetch news from the server
  const fetchTodaysNews = async () => {
    try {
      setLoading(true);
      setError('');
      console.log("Fetching today's news from API");
      
      // Use HTTPS if SSL is set up, otherwise HTTP
      const url = `${API}/news`
      
      // Call the server endpoint for today's news
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.details || errorData?.error || `Error ${res.status}: ${res.statusText}`;
        throw new Error(errorMessage);
      }
      
      const data = await res.json();
      console.log("Fetched news data:", data);
      
      // If we have data, use it
      if (data && Array.isArray(data)) {
        // Filter out articles with no meaningful content
        const validArticles = data.filter(article => 
          article.title && 
          article.description && 
          article.source
        );
        
        setNews(validArticles);
        console.log(`Successfully loaded ${validArticles.length} news articles`);
        
        if (validArticles.length === 0) {
          throw new Error("Keine gültigen Nachrichtenartikel für heute gefunden");
        }
      } else {
        // Handle invalid data format
        console.warn("API returned invalid data format");
        throw new Error("Ungültiges Datenformat von der API erhalten");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(`Konnte die heutigen Nachrichten nicht laden: ${err.message}. Bitte überprüfen Sie Ihre Serververbindung.`);
      setNews([]); // Clear any existing news
      setLoading(false);
    }
  };

  // Function to stop any ongoing speech
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setCurrentArticleIndex(null);
    }
  };

  // Text-to-speech function with slower speed for elderly users
  const speakText = (text, articleIndex) => {
    // Stop any ongoing speech
    stopSpeaking();
    
    if (!text) return;
    
    try {
      // Create a new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties for elderly-friendly speech
      utterance.rate = 0.8; // Slower speed for elderly
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a German voice since the news is in German
      let selectedVoice = voices.find(voice => 
        voice.lang === 'de-DE' && 
        (voice.name.includes('Google Deutsch') || 
         voice.name.includes('Microsoft Hedda') || 
         voice.name.includes('Anna'))
      );
      
      // If no specific German voice found, try any German voice
      if (!selectedVoice) {
        selectedVoice = voices.find(voice => 
          voice.lang.startsWith('de')
        );
      }
      
      // If still no voice found, use any available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
        console.log("No German voice found, using default voice:", selectedVoice.name);
      }
      
      // If a suitable voice was found, use it
      if (selectedVoice) {
        console.log("Using voice:", selectedVoice.name);
        utterance.voice = selectedVoice;
      }
      
      // Track which article is being spoken
      setCurrentArticleIndex(articleIndex);
      
      // Start and end events
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => {
        setSpeaking(false);
        setCurrentArticleIndex(null);
      };
      
      // Handle errors
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setSpeaking(false);
        setCurrentArticleIndex(null);
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
      setSpeaking(false);
      setCurrentArticleIndex(null);
    }
  };

  // Create a description for text-to-speech from a news article
  const createNewsDescription = (article) => {
    if (!article) return "";
    
    // Create an elderly-friendly description
    let description = `${article.title}. `;
    
    if (article.description) {
      description += `${article.description}. `;
    }
    
    description += `Diese Nachricht ist von ${article.source}. `;
    
    return description;
  };

  // Format the published date to be more readable
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error("Date formatting error:", e);
      return dateString; // Return the original string if formatting fails
    }
  };

  // Retry fetching news
  const retryFetch = () => {
    setError('');
    fetchTodaysNews();
  };

  return (
    <div className="p-4 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">Heute Nachrichten</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-xl text-gray-600">Nachrichten werden geladen...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border-l-8 border-red-600 text-red-700 p-6 rounded-lg mb-6 text-xl">
          <h3 className="font-bold text-2xl mb-2">Fehler</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={retryFetch}
            className="mt-4 px-5 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500 mb-4">Keine Nachrichten für heute gefunden</p>
          <button 
            onClick={retryFetch}
            className="px-5 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Aktualisieren
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <p className="text-lg text-gray-600">
              {news.length} Artikel für heute gefunden
            </p>
            <button 
              onClick={stopSpeaking}
              className={`px-5 py-3 rounded-lg text-lg font-semibold ${speaking ? "bg-red-500 text-white" : "bg-gray-300 text-gray-500"}`}
              disabled={!speaking}
            >
              <span className="mr-2 text-xl">🔇</span>
              Vorlesen stoppen
            </button>
          </div>
          
          <ul className="space-y-6">
            {news.map((article, index) => (
              <li 
                key={index} 
                className={`border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
                  currentArticleIndex === index ? "border-2 border-yellow-500" : ""
                }`}
              >
                <div className="p-5 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{article.title}</h3>
                    <p className="text-gray-500 mt-1">
                      Quelle: {article.source} | {formatDate(article.published_at)}
                    </p>
                  </div>
                  
                  {currentArticleIndex === index && speaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center px-4 py-2 rounded-lg text-lg font-semibold bg-yellow-500 text-white"
                      aria-label="Vorlesen stoppen"
                    >
                      <span className="mr-2 text-xl">🔇</span>
                      Stoppen
                    </button>
                  ) : (
                    <button
                      onClick={() => speakText(createNewsDescription(article), index)}
                      className="flex items-center px-4 py-2 rounded-lg text-lg font-semibold bg-green-600 text-white"
                    >
                      <span className="mr-2 text-xl">🔊</span>
                      Vorlesen
                    </button>
                  )}
                </div>
                
                <div className="p-5 bg-white">
                  {article.image && (
                    <div className="mb-4">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-auto rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'; // Hide image on error
                        }}
                      />
                    </div>
                  )}
                  
                  <p className="text-lg text-gray-700 mb-4">{article.description}</p>
                  
                  {article.url && (
                    <div className="mt-4">
                      <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Weiterlesen
                      </a>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default News;