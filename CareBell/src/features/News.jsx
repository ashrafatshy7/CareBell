// src/components/News.jsx
import React, { useState, useEffect } from "react";
import { API, NEWS_REGIONS } from "../shared/config";
import { useTranslation } from "react-i18next";
import { playTts } from "../shared/tts";

export default function News() {
  const { t, i18n } = useTranslation();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Load saved regions, or fall back to default
  const [regions, setRegions] = useState(() => {
    const saved = localStorage.getItem("news_regions");
    return saved ? saved.split(",") : NEWS_REGIONS.split(",");
  });

  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [currentArticleIndex, setCurrentArticleIndex] = useState(null);
  const [audioObj, setAudioObj] = useState(null);

  // 2) Persist regions & re-fetch on change
  useEffect(() => {
    localStorage.setItem("news_regions", regions.join(","));
    fetchTodaysNews(regions);
  }, [regions]);

  // clean up any playing audio on unmount
  useEffect(() => () => {
    if (audioObj) audioObj.pause();
  }, [audioObj]);

  const fetchTodaysNews = async (selectedRegions) => {
    setLoading(true);
    setError("");
    const regionParam = Array.isArray(selectedRegions)
      ? selectedRegions.join(",")
      : selectedRegions;
    const url = `${API}/news/todays-news?regions=${encodeURIComponent(regionParam)}`;
    const maxRetries = 2;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Fetching news (attempt ${attempt})`);
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
        throw new Error("Unerwartetes Format der Nachrichten");
        }
        setNews(data);
        break;
      } catch (err) {
        console.error(`News fetch error on attempt ${attempt}:`, err);
        if (attempt === maxRetries) {
          setError(`Konnte die heutigen Nachrichten nicht laden: ${err.message}`);
          setNews([]);
        } else {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }

    setLoading(false);
  };

  const stopSpeaking = () => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
      setAudioObj(null);
    }
    setSpeaking(false);
    setCurrentArticleIndex(null);
  };

  const speakText = async (text, index) => {
    stopSpeaking();
    if (!text) return;
    try {
      const lang = i18n.language.split("-")[0];
      const audio = await playTts(text, lang);
      setAudioObj(audio);
      setSpeaking(true);
      setCurrentArticleIndex(index);
      audio.onended = () => {
        setSpeaking(false);
        setCurrentArticleIndex(null);
        setAudioObj(null);
      };
    } catch (err) {
      console.error("TTS error:", err);
      setSpeaking(false);
      setCurrentArticleIndex(null);
    }
  };

  const createNewsDescription = (article) => {
    let desc = `${article.title}. `;
    if (article.description) desc += `${article.description}. `;
    desc += `Diese Nachricht ist von ${article.source}. `;
    return desc;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const retryFetch = () => fetchTodaysNews(regions);

  const STATE_OPTIONS = [
    { code: "1", key: "badenWuerttemberg" },
    { code: "2", key: "bavaria" },
    { code: "3", key: "berlin" },
    { code: "4", key: "brandenburg" },
    { code: "5", key: "bremen" },
    { code: "6", key: "hamburg" },
    { code: "7", key: "hesse" },
    { code: "8", key: "mecklenburgVorpommern" },
    { code: "9", key: "lowerSaxony" },
    { code: "10", key: "northRhineWestphalia" },
    { code: "11", key: "rhinelandPalatinate" },
    { code: "12", key: "saarland" },
    { code: "13", key: "saxony" },
    { code: "14", key: "saxonyAnhalt" },
    { code: "15", key: "schleswigHolstein" },
    { code: "16", key: "thuringia" },
  ];

  return (
    <div className="p-3 max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-3 text-center text-blue-800 dark:text-blue-200">
        {t("News.latestNews")}
      </h1>

      {/* region selector */}
      <div className="relative mb-3">
        <button
          onClick={() => setRegionDropdownOpen((o) => !o)}
          className="border rounded px-2 py-1 w-full text-left text-sm"
        >
          {t("News.selectRegions")}
        </button>
        {regionDropdownOpen && (
          <div className="absolute left-0 right-0 mt-1 border rounded p-2 bg-white dark:bg-gray-700 max-h-40 overflow-y-auto z-10">
            {STATE_OPTIONS.map((opt) => (
              <label key={opt.code} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={opt.code}
                  checked={regions.includes(opt.code)}
                  onChange={(e) => {
                    const code = e.target.value;
                    if (e.target.checked) {
                      setRegions((prev) => [...prev, code]);
                    } else {
                      setRegions((prev) => prev.filter((r) => r !== code));
                    }
                  }}
                />
                {t(`News.${opt.key}`)}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* loading / error / list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("News.loading")}
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-600 text-red-700 dark:text-red-200 p-4 rounded-lg mb-4 text-sm">
          <h3 className="font-bold text-lg mb-2">{t("News.errorTitle")}</h3>
          <p className="mb-3">{error}</p>
          <button
            onClick={retryFetch}
            className="mt-2 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("News.retry")}
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {news.length} {t("News.articlesFound")}
            </p>
            <button
              onClick={stopSpeaking}
              className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                speaking
                  ? "bg-red-500 text-white"
                  : "bg-gray-300 text-gray-500"
              }`}
              disabled={!speaking}
            >
              <span className="mr-1 text-lg">🔇</span>
              {t("News.stopReading")}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {news.map((article, idx) => (
              <div
                key={idx}
                className={`border ${
                  currentArticleIndex === idx
                    ? "border-yellow-500 border-2"
                    : "border-gray-200 dark:border-gray-600"
                } rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow`}
              >
                <div className="p-3 bg-gray-50 dark:bg-gray-700 flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 truncate">
                      {t("News.source")}: {article.source} |{" "}
                      {formatDate(article.published_at)}
                    </p>
                  </div>
                  {currentArticleIndex === idx && speaking ? (
                    <button
                      onClick={stopSpeaking}
                      className="flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-500 text-white ml-2 flex-shrink-0"
                    >
                      <span className="mr-1 text-sm">🔇</span>
                      {t("News.stop")}
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        speakText(createNewsDescription(article), idx)
                      }
                      className="flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-600 text-white ml-2 flex-shrink-0"
                    >
                      <span className="mr-1 text-sm">🔊</span>
                      {t("News.read")}
                    </button>
                  )}
                </div>
                <div className="p-3 bg-white dark:bg-gray-800">
                  {article.image && (
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
                    {article.description}
                  </p>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("News.readMore")}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
