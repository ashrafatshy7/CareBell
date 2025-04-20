// vapi.js
const assistantId = "9f5a71a0-46c9-4200-905d-b045b97457a8";
const apiKey      = "34b0ba5a-cd6c-4ef8-ab98-addf755012c1";

(function(d, t) {
  // 1) Load the Vapi.ai SDK
  const g = d.createElement(t),
        s = d.getElementsByTagName(t)[0];
  g.src   = "vapisrc.js";
  g.defer = true;
  g.async = true;
  s.parentNode.insertBefore(g, s);

  g.onload = () => {
    // 2) Initialize, mount into your #vapi-button, disable default launcher
    window.vapiInstance = window.vapiSDK.run({
      apiKey,
      assistant: assistantId,
      container: document.getElementById("vapi-button"),
      config: {
        useDefaultButton: false,
        idle:    { color: "#2444ac", type: "pill", title: "Talk to Bella" },
        loading: { color: "#2444ac", type: "pill", title: "Connecting…" },
        active:  { color: "#2444ac", type: "pill", title: "Bella is talking" }
      }
    });

    // 3) After the SDK has injected its support button,
    //    grab it and relocate it into #vapi-button
    setTimeout(() => {
      const supportBtn = d.getElementById("vapi-support-btn");
      const mount      = d.getElementById("leftSide");
      if (supportBtn && mount) {
        // Append into your Bella launcher container
        mount.appendChild(supportBtn);

        // Reset its positioning so it flows inline
        supportBtn.style.position = "inherit";
        supportBtn.style.bottom   = "";
        supportBtn.style.right    = "";
        supportBtn.style.marginLeft = "10px";
      }
    }, 100);
  };
})(document, "script");