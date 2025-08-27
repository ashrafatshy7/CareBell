// src/components/Meals.jsx
import React, { useState, useEffect, useContext } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { API } from "../shared/config";
import { useTranslation } from "react-i18next";
import { playTts } from "../shared/tts";
import { AppContext } from "../shared/AppContext";

export default function Meals() {
  const { t, i18n } = useTranslation();
  const { user } = useContext(AppContext);
  const userAllergens = user?.Allergens || [];

  /* ---------- state ---------- */
  const [activeTab,    setActiveTab]    = useState("scanner");
  const [allMeals,     setAllMeals]     = useState([]);
  const [scanning,     setScanning]     = useState(false);
  const [manualCode,   setManualCode]   = useState("");
  const [barcode,      setBarcode]      = useState(null);
  const [meal,         setMeal]         = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [speaking,     setSpeaking]     = useState(false);
  const [audioObj,     setAudioObj]     = useState(null);

  /* ---------- effects ---------- */
  useEffect(() => { fetchAllMeals(); }, []);
  useEffect(() => () => { if (audioObj) audioObj.pause(); }, [audioObj]);

  /* ---------- fetch helpers ---------- */
  const fetchAllMeals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/foods`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");
      setAllMeals(data);
    } catch (err) {
      setError(`Could not load meals: ${err.message}`);
      setAllMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchByCode = async code => {
    setBarcode(code);
    setLoading(true);
    speakText(t("Meals.qrScanned"));
    try {
      const res = await fetch(`${API}/${code}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("404");
        throw new Error(`Server ${res.status}`);
      }
      const data = await res.json();
      setMeal(data);
      setTimeout(() => speakText(createFoodDescription(data)), 1000);
    } catch {
      const fallback = allMeals.find(m => m.barcode === code);
      if (fallback) {
        setMeal(fallback);
        setTimeout(() => speakText(createFoodDescription(fallback)), 1000);
      } else {
        setError(t("Meals.notFoundWithCode", { code }));
        setMeal(null);
        speakText(t("Meals.notFoundSpoken"));
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- barcode handlers ---------- */
  const handleDetected = (_, result) => {
    if (!result) return;
    setScanning(false);
    fetchByCode(result.text);
  };

  const handleManualSubmit = () => {
    const code = manualCode.trim();
    if (!code) return;
    fetchByCode(code);
  };

  /* ---------- speech ---------- */
  const toggleScanner = () => {
    setScanning(s => !s);
    if (!scanning) speakText(t("Meals.positionLabel"));
  };

  const speakText = async text => {
    stopSpeaking();
    if (!text) return;
    try {
      const lang = i18n.language.split('-')[0];
      const audio = await playTts(text, lang);
      setAudioObj(audio);
      setSpeaking(true);
      audio.onended = () => {
        setSpeaking(false);
        setAudioObj(null);
      };
    } catch (err) {
      console.error('TTS error:', err);
    }
  };

  const stopSpeaking = () => {
    if (audioObj) {
      audioObj.pause();
      audioObj.currentTime = 0;
      setAudioObj(null);
    }
    setSpeaking(false);
  };

  /* ---------- description builder ---------- */
  const createFoodDescription = item => {
    let desc = `${item.Dish}. ${item.Description || t("Meals.noDescription")}. `;
    desc += `It's ${item.diabetic_friendly ? "" : "NOT "}Diabetic Friendly. `;
    if (item.Allergens?.length) {
      const allergenList = trAllergens(item.Allergens).join(", ");
      desc += `Allergens: ${allergenList}. `;
    }
    if (item.Additives?.length) {
      const additiveList = trAdditives(item.Additives).join(", ");
      desc += `Additives: ${additiveList}. `;
    }
    if (item.Pictograms?.length) {
      const pictogramList = trPictograms(item.Pictograms).join(", ");
      desc += `${pictogramList}.`;
    }
    return desc;
  };

  /* ---------- locale helpers ---------- */
  const trAdditives  = codes => (codes||[]).map(c => t(`Meals.Legend.Additives.${c}`));
  const trAllergens  = list  => (list||[]).map(a => t(`Meals.Legend.Allergens.${a}`));
  const trPictograms = codes => (codes||[]).map(p => t(`Meals.Legend.Pictograms.${p}`));

  const backToList = () => {
    setMeal(null);
    setManualCode("");
    setError("");
    setActiveTab("scanner");
  };

  return (
    <div className="p-3 max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center text-blue-800">
        {t("Meals.FoodInfo")}
      </h1>

      {/* SCANNER TAB (or Manual Entry) */}
      {!meal && (
        <div className="mb-4">
          {/* Manual Code Entry */}
          <div className="mb-3 flex">
          <input
              type="text"
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder={t("Meals.enterBarcodePlaceholder")}
              className="
                flex-1 px-3 py-2 rounded-l-lg
                border border-gray-300 bg-white text-gray-900 placeholder-gray-500
                focus:outline-none
                dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400
              "
            />
            <button
              onClick={handleManualSubmit}
              className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
            >
              {t("Meals.enterButton")}
            </button>
          </div>

          {/* Scanner Controls and Feed */}
          {scanning ? (
            <>
              <div className="relative mb-3">
                <div className="border-2 border-blue-400 dark:border-yellow-400 rounded-lg overflow-hidden">
                  <BarcodeScannerComponent
                    width="100%" height={250}
                    onUpdate={handleDetected}
                    delay={300}
                    facingMode="environment"
                    videoConstraints={{ width:{ideal:1280}, height:{ideal:720} }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/5 h-3/5 border-2 border-red-500 border-dashed rounded opacity-70" />
                  </div>
                </div>
                <p className="text-center text-sm mt-2 text-gray-600 font-medium">
                  {t("Meals.positionLabel")}
                </p>
              </div>
              <button
                onClick={toggleScanner}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-red-500 text-white text-lg font-bold"
              >
                <span className="mr-2 text-xl">📷</span>
                {t("Meals.stopCamera")}
              </button>
            </>
          ) : (
            <button
              onClick={toggleScanner}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-green-500 text-white text-lg font-bold"
            >
              <span className="mr-2 text-xl">📷</span>
              {t("Meals.startCamera")}
            </button>
          )}
        </div>
      )}

      {/* SINGLE MEAL VIEW */}
      {meal && (
        <div className="bg-green-50 p-4 mt-4 rounded-lg border-l-4 border-green-500 shadow-lg dark:border-yellow-400 dark:bg-slate-700">
          {meal.imageURL && (
            <img
              src={meal.imageURL}
              alt={meal.Dish}
              onError={e => e.target.style.display = "none"}
              className="w-full max-w-sm mx-auto rounded-lg shadow-md mb-4"
            />
          )}

          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{meal.Dish}</h2>
              <p className="text-gray-600 text-sm mb-3 dark:text-white">
                {t("Meals.barcodeLabel")} {meal.barcode}
              </p>
            </div>

            {speaking ? (
              <button
                onClick={stopSpeaking}
                className="flex items-center px-3 py-2 rounded-lg bg-yellow-500 text-white text-sm"
              >
                <span className="mr-1 text-lg">🔇</span>
                {t("Meals.SpeakingLabel")}
              </button>
            ) : (
              <button
                onClick={() => speakText(createFoodDescription(meal))}
                className="flex items-center px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
              >
                <span className="mr-1 text-lg">🔊</span>
                {t("Exercise.read")} 
              </button>
            )}
          </div>

          <div className="my-4">
            <h3 className="text-lg font-semibold mb-2">{t("Exercise.descriptionLabel")}</h3>
            <p className="text-sm leading-relaxed">
              {meal.Description || t("Meals.noDescription")}
            </p>
          </div>

          {(() => {
            if (!user) return null;
            const overlap = meal.Allergens?.filter(a => userAllergens.includes(a));
            return overlap.length ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 rounded mb-4">
                <p className="font-semibold mb-1 text-sm">{t("Meals.allergyWarning")}</p>
                <ul className="list-disc list-inside text-sm">
                  {overlap.map(key => <li key={key}>{t(`Meals.Legend.Allergens.${key}`)}</li>)}
                </ul>
              </div>
            ) : null;
          })()}

          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-1">{t("Meals.diabeticFriendlyLabel")}</h3>
            <p className="text-sm font-medium flex items-center">
              <span className={`mr-2 text-lg ${meal.diabetic_friendly ? "text-green-600" : "text-red-600"}`}>{meal.diabetic_friendly ? "✓" : "✕"}</span>
              {t(meal.diabetic_friendly ? "Meals.diabeticFriendlyYes" : "Meals.diabeticFriendlyNo")}
            </p>
          </div>

          {(() => {
            const renderSection = (key, list, tr) => list.length > 0 && (
              <div key={key} className="mt-4">
                <h3 className="text-lg font-semibold mb-2">{t(`Meals.LegendHeadings.${key}`)}</h3>
                <ul className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm dark:bg-slate-900">
                  {list.map((val, i) => {
                    const allergic = key === "Allergens" && userAllergens.includes(val);
                    return (
                      <li key={i} className="py-2 text-sm border-b border-gray-100 last:border-0 flex items-center">
                        <span className={`mr-2 text-lg ${allergic ? "text-red-600" : "text-green-500"}`}>{allergic ? "✕" : "✓"}</span>
                        {tr(val)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
            return (
              <>
                {renderSection("Allergens", meal.Allergens || [], a => t(`Meals.Legend.Allergens.${a}`))}
                {renderSection("Additives", meal.Additives || [], a => t(`Meals.Legend.Additives.${a}`))}
                {renderSection("Pictograms", meal.Pictograms || [], a => t(`Meals.Legend.Pictograms.${a}`))}
              </>
            );
          })()}

          <div className="mt-4 flex justify-center">
            <button onClick={backToList} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
              {t("Meals.back")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
