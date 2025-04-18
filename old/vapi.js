
var vapiInstance = null;
const assistant = "9f5a71a0-46c9-4200-905d-b045b97457a8"; 
const apiKey = "34b0ba5a-cd6c-4ef8-ab98-addf755012c1"; 
const buttonConfig = {
position: "bottom-right", // "" | "top" | "left" | "right" | "top-right" | "top-left" | "bottom-left" | "bottom-right"
offset: "300px", // decide how far the button should be from the edge
width: "200px", // min-width of the button
height: "150px", // height of the button
idle: { // button state when the call is not active.
color: `rgb(93, 254, 202)`, 
type: "pill", // or "round"
title: "Hier können Sie mich starten", // only required in case of Pill
subtitle: "und beenden.", // only required in case of pill
icon: `https://unpkg.com/lucide-static@0.321.0/icons/phone.svg`,
},
loading: { // button state when the call is connecting
color: `rgb(93, 124, 202)`,
type: "pill", // or "round"
title: "Baue eine Verbindung auf...", // only required in case of Pill
subtitle: "bitte warten", // only required in case of pill
icon: `https://unpkg.com/lucide-static@0.321.0/icons/loader-2.svg`,
},
active: { // button state when the call is in progress or active.
color: `rgb(255, 0, 0)`,
type: "pill", // or "round"
title: "Laufendes Gespräch...", // only required in case of Pill
subtitle: "hier Gespräch beenden.", // only required in case of pill
icon: `https://unpkg.com/lucide-static@0.321.0/icons/phone-off.svg`,
},
};


(function (d, t) {
    var g = document.createElement(t),
        s = d.getElementsByTagName(t)[0];
    g.src = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
    g.defer = true;
    g.async = true;
    s.parentNode.insertBefore(g, s);

    g.onload = function () {
        vapiInstance = window.vapiSDK.run({
            apiKey: apiKey,
            assistant: assistant,
            config: buttonConfig,
            container: document.getElementById("vapi-button"), // Fügt den Button ein
        });
    };
})(document, "script");

setTimeout(() => {
document.querySelector("#vapi-button").style.transform = "scale(2)";
}, 2000); // Wartet 2 Sekunden, um sicherzustellen, dass der Button da ist

