/* Ask us: the chat box for the Crossland AI site. Vanilla JS, no libraries, no cookies, no storage.
   Put <div class="ask-us" data-lang="en"></div> on a page, load ask-us.css and this file.
   Options on the div (all optional):
     data-lang      "en" or "es" (default: the page's <html lang>)
     data-endpoint  the chat service address, e.g. https://ask-us.<your-subdomain>.workers.dev/chat
     data-demo      "true" forces demo mode (sample answers written in advance; nothing is sent anywhere)
     data-data-page link to the Data and security page (default "data.html")
   With no endpoint (or the placeholder below) the box runs in demo mode, clearly labelled on screen.
   The conversation lives only in this page's memory: a reload starts fresh. */
(function () {
  "use strict";
  var DEFAULT_ENDPOINT = "https://ask-us-service.onrender.com/chat"; // the live service (Render); data-endpoint on the div overrides it
  var PLACEHOLDER = "https://ask-us.YOUR-SUBDOMAIN.workers.dev/chat";
  var EMAIL = "info@humaniasoluciones.com";
  var MAX_CHARS = 500;
  var HISTORY = 6; // earlier messages sent back with each question (the server accepts up to 7 in all)
  var TIMEOUT_MS = 90000; // the free plan can take about a minute to wake up on the first reply
  var SLOW_MS = 4000; // after this long, say "one moment"

  var T = {
    en: {
      title: "Ask us",
      intro: "Short answers about what we do, from our AI.",
      demo: "Demo mode: sample answers written in advance. Not the live AI. Nothing you type is sent.",
      chipsLabel: "Suggested questions",
      chips: ["What can AI take off my team?", "Where do I start?", "What does it cost?", "Where does my data live?"],
      label: "Your question",
      placeholder: "Type a question about AI for your company",
      send: "Ask",
      count: "{n} of 500 characters",
      privacy: "Don't share personal data. We don't save your messages on our site. They are sent to an AI service to answer you, and that service may keep them for a limited time.",
      dataLink: "Data and security",
      panel: "Answers",
      close: "Close",
      you: "You",
      ai: "AI answer. For a person, ",
      aiDemo: "Sample answer (demo mode). For a person, ",
      emailLink: "email us",
      emailBtn: "Email us",
      typing: "Writing an answer…",
      slow: "One moment, please. This can take up to a minute. Thank you for waiting.",
      answered: "Answer ready.",
      limit: "You have reached the limit of questions for now. Please email us at " + EMAIL + ".",
      busy: "Our AI can't answer right now. Please try again later, or email us at " + EMAIL + ".",
      offline: "We couldn't reach our AI. Please email us at " + EMAIL + ".",
      tooLong: "Please keep your question under 500 characters.",
      stopped: "The chat is paused. Please email us at " + EMAIL + ".",
    },
    es: {
      title: "Pregúntenos",
      intro: "Respuestas cortas sobre lo que hacemos, de nuestra IA.",
      demo: "Modo demostración: respuestas de ejemplo escritas de antemano. No es la IA en vivo. Lo que escriba no se envía.",
      chipsLabel: "Preguntas sugeridas",
      chips: ["¿Qué trabajo le puede quitar la IA a mi equipo?", "¿Por dónde empiezo?", "¿Cuánto cuesta?", "¿Dónde quedan mis datos?"],
      label: "Su pregunta",
      placeholder: "Escriba una pregunta sobre IA para su empresa",
      send: "Preguntar",
      count: "{n} de 500 caracteres",
      privacy: "No comparta datos personales. No guardamos sus mensajes en nuestro sitio. Se envían a un servicio de IA para responderle, y ese servicio puede conservarlos por un tiempo limitado.",
      dataLink: "Datos y seguridad",
      panel: "Respuestas",
      close: "Cerrar",
      you: "Usted",
      ai: "Respuesta de IA. Para hablar con una persona, ",
      aiDemo: "Respuesta de ejemplo (modo demostración). Para hablar con una persona, ",
      emailLink: "escríbanos",
      emailBtn: "Escríbanos",
      typing: "Escribiendo una respuesta…",
      slow: "Un momento, por favor. Esto puede tardar hasta un minuto. Gracias por esperar.",
      answered: "Respuesta lista.",
      limit: "Llegó al límite de preguntas por ahora. Escríbanos a " + EMAIL + ".",
      busy: "Nuestra IA no puede responder en este momento. Intente más tarde, o escríbanos a " + EMAIL + ".",
      offline: "No pudimos comunicarnos con nuestra IA. Escríbanos a " + EMAIL + ".",
      tooLong: "Por favor, escriba su pregunta en menos de 500 caracteres.",
      stopped: "El chat está en pausa. Escríbanos a " + EMAIL + ".",
    },
  };

  // Demo answers: only facts from the site's own pages (Home, Start, FAQ, Data and security).
  var DEMO = {
    en: [
      "AI can take repetitive work off your people, so they keep the work only people can do. The decisions stay with them. Which task takes your team the most time today?",
      "Start with a short first call about which door fits you. Then you get a plain plan, and one fixed first step agreed with you before it starts. To set up the call, email us at " + EMAIL + ".",
      "No prices are published yet. We agree it on the first call, once we know what you need. To set up the call, email us at " + EMAIL + ".",
      "It depends on which of four ways runs the AI: a local model on your own systems, a large language model on the provider's servers, hosted by us, or installed on your servers. We agree it with you before we start.",
    ],
    es: [
      "La IA puede quitarle a su gente el trabajo repetitivo, para que se quede con el trabajo que solo las personas pueden hacer. Las decisiones siguen en sus manos. ¿Qué tarea le quita más tiempo a su equipo hoy?",
      "Empiece con una primera llamada corta sobre qué puerta le sirve. Luego recibe un plan claro y un primer paso fijo, acordado con usted antes de empezar. Para agendar la llamada, escríbanos a " + EMAIL + ".",
      "Todavía no publicamos precios. Lo acordamos en la primera llamada, cuando sepamos qué necesita. Para agendar la llamada, escríbanos a " + EMAIL + ".",
      "Depende de cuál de las cuatro formas opera la IA: un modelo local en sus propios sistemas, un modelo de lenguaje grande en los servidores del proveedor, alojado por nosotros, o instalado en sus servidores. Lo acordamos con usted antes de empezar.",
    ],
    fallback: {
      en: "In demo mode I only have sample answers to the four questions above. For anything else, please email us at " + EMAIL + ".",
      es: "En modo demostración solo tengo respuestas de ejemplo para las cuatro preguntas de arriba. Para cualquier otra cosa, escríbanos a " + EMAIL + ".",
    },
  };

  var uid = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function newSessionId() {
    var b = new Uint8Array(18), s = "", i;
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(b);
    else for (i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
    for (i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function init(root) {
    if (root.getAttribute("data-ready")) return;
    root.setAttribute("data-ready", "1");
    var lang = (root.getAttribute("data-lang") || document.documentElement.lang || "en").slice(0, 2).toLowerCase() === "es" ? "es" : "en";
    var t = T[lang];
    var cfg = window.ASK_US_CONFIG || {};
    var endpoint = root.getAttribute("data-endpoint") || cfg.endpoint || DEFAULT_ENDPOINT;
    var demo = root.getAttribute("data-demo") === "true" || !endpoint || endpoint === PLACEHOLDER;
    var dataPage = root.getAttribute("data-data-page") || "data.html";
    var n = ++uid, id = function (s) { return "au" + n + "-" + s; };
    var sessionId = newSessionId();
    var history = []; // {role, content, sig}
    var busy = false, stopped = false;

    root.textContent = "";
    root.classList.add("au");
    root.setAttribute("lang", lang);
    var box = el("section", "au-box");
    box.setAttribute("aria-labelledby", id("h"));

    var h = el("h2", "au-h", t.title);
    h.id = id("h");
    box.appendChild(h);
    box.appendChild(el("p", "au-intro", t.intro));
    if (demo) {
      var dm = el("p", "au-demo", t.demo);
      dm.id = id("demo");
      box.appendChild(dm);
    }

    var chips = el("div", "au-chips");
    chips.setAttribute("role", "group");
    chips.setAttribute("aria-label", t.chipsLabel);
    var chipBtns = t.chips.map(function (q, i) {
      var b = el("button", "au-chip", q);
      b.type = "button";
      b.addEventListener("click", function () { ask(q, i); });
      chips.appendChild(b);
      return b;
    });
    box.appendChild(chips);

    var form = el("form", "au-form");
    form.setAttribute("novalidate", "");
    var lab = el("label", "au-label", t.label);
    lab.htmlFor = id("in");
    var row = el("div", "au-row");
    var input = el("input", "au-input");
    input.type = "text";
    input.id = id("in");
    input.maxLength = MAX_CHARS;
    input.autocomplete = "off";
    input.setAttribute("enterkeyhint", "send");
    input.placeholder = t.placeholder;
    input.setAttribute("aria-describedby", id("count") + " " + id("priv") + (demo ? " " + id("demo") : ""));
    var sendBtn = el("button", "au-send", t.send);
    sendBtn.type = "submit";
    row.appendChild(input);
    row.appendChild(sendBtn);
    var count = el("p", "au-count", t.count.replace("{n}", "0"));
    count.id = id("count");
    form.appendChild(lab);
    form.appendChild(row);
    form.appendChild(count);
    box.appendChild(form);

    var priv = el("p", "au-privacy");
    priv.id = id("priv");
    priv.appendChild(document.createTextNode(t.privacy + " "));
    var dl = el("a", "au-datalink", t.dataLink);
    dl.href = dataPage;
    priv.appendChild(dl);
    box.appendChild(priv);

    var panel = el("div", "au-panel");
    panel.id = id("panel");
    panel.hidden = true;
    var ptop = el("div", "au-ptop");
    ptop.appendChild(el("p", "au-ptitle", t.panel));
    var closeBtn = el("button", "au-close", t.close);
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-controls", id("panel"));
    ptop.appendChild(closeBtn);
    panel.appendChild(ptop);
    var log = el("div", "au-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    log.setAttribute("aria-label", t.panel);
    panel.appendChild(log);
    var typing = el("p", "au-typing");
    typing.hidden = true;
    typing.setAttribute("aria-hidden", "true"); // the hidden status line below says it to screen readers
    typing.appendChild(el("span", "au-dots"));
    var typingText = document.createTextNode(" " + t.typing);
    typing.appendChild(typingText);
    panel.appendChild(typing);
    box.appendChild(panel);

    var status = el("p", "au-status");
    status.setAttribute("role", "status");
    box.appendChild(status);

    var foot = el("div", "au-foot");
    var mail = el("a", "au-email", t.emailBtn);
    mail.href = "mailto:" + EMAIL;
    foot.appendChild(mail);
    foot.appendChild(el("span", "au-addr", EMAIL));
    box.appendChild(foot);
    root.appendChild(box);

    function openPanel() { panel.hidden = false; }
    function closePanel() {
      panel.hidden = true;
      input.focus();
    }
    closeBtn.addEventListener("click", closePanel);

    // Escape closes the answers. It is stopped here so the site's own Escape (back to the map) does not fire too.
    root.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) {
        e.preventDefault();
        e.stopPropagation();
        closePanel();
      }
    });

    input.addEventListener("input", function () {
      count.textContent = t.count.replace("{n}", String(input.value.length));
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ask(input.value, -1);
    });

    function addMsg(who, text, kind) {
      var m = el("div", "au-msg au-" + who + (kind ? " au-" + kind : ""));
      var w = el("p", "au-who");
      if (who === "you") w.textContent = t.you;
      else {
        w.appendChild(document.createTextNode(demo ? t.aiDemo : t.ai));
        var a = el("a", "au-inlinemail", t.emailLink);
        a.href = "mailto:" + EMAIL;
        w.appendChild(a);
      }
      m.appendChild(w);
      m.appendChild(el("p", "au-text", text));
      log.appendChild(m);
      return m;
    }

    // While waiting, buttons are marked (not disabled) so keyboard focus never jumps away.
    function setBusy(on) {
      busy = on;
      typing.hidden = !on;
      [sendBtn].concat(chipBtns).forEach(function (b) {
        if (on) b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled");
      });
      input.readOnly = on;
      typingText.nodeValue = " " + t.typing;
      status.textContent = on ? t.typing : "";
    }

    // The free plan can need about a minute to wake up. After SLOW_MS the wait says so, politely.
    var slowTimer = null;
    function slowOn() { slowTimer = setTimeout(function () { typingText.nodeValue = " " + t.slow; status.textContent = t.slow; }, SLOW_MS); }
    function slowOff() { if (slowTimer) { clearTimeout(slowTimer); slowTimer = null; } }

    // One quiet wake-up request (no cookie, no message) the first time the visitor uses the box, so the first answer is faster.
    var warmed = false;
    function warm() {
      if (demo || warmed) return;
      warmed = true;
      try {
        fetch(endpoint.replace(/\/chat$/, "/health"), { method: "GET", mode: "cors", credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer" })
          .then(function () {}, function () {});
      } catch (e) { /* the real question will try again */ }
    }
    input.addEventListener("focus", warm);
    chipBtns.forEach(function (b) { b.addEventListener("pointerdown", warm); });

    function stop() {
      stopped = true;
      var inside = root.contains(document.activeElement);
      input.disabled = true;
      sendBtn.disabled = true;
      chipBtns.forEach(function (b) { b.disabled = true; });
      root.classList.add("au-stopped");
      if (inside) mail.focus();
    }

    function show(m) {
      if (m && m.scrollIntoView) {
        try { m.scrollIntoView({ block: "nearest" }); } catch (e) { m.scrollIntoView(false); }
      }
    }

    function ask(text, chipIndex) {
      if (busy || stopped) return;
      text = String(text || "").replace(/\s+/g, " ").trim();
      if (!text) { input.focus(); return; }
      if (text.length > MAX_CHARS) { status.textContent = t.tooLong; return; }
      openPanel();
      addMsg("you", text);
      input.value = "";
      count.textContent = t.count.replace("{n}", "0");
      setBusy(true);
      if (demo) {
        setTimeout(function () {
          setBusy(false);
          var reply = chipIndex >= 0 ? DEMO[lang][chipIndex] : DEMO.fallback[lang];
          show(addMsg("ai", reply));
          status.textContent = t.answered;
        }, 600);
        return;
      }
      var msgs = history.slice(-HISTORY);
      while (msgs.length && msgs[0].role !== "user") msgs.shift();
      msgs = msgs.concat([{ role: "user", content: text }]);
      var ctrl = window.AbortController ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
      slowOn();
      fetch(endpoint, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        referrerPolicy: "no-referrer",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId, lang: lang, messages: msgs }),
        signal: ctrl ? ctrl.signal : undefined,
      })
        .then(function (res) {
          return res.json().then(function (d) { return { res: res, d: d }; }, function () { return { res: res, d: null }; });
        })
        .then(function (r) {
          clearTimeout(timer);
          slowOff();
          setBusy(false);
          var d = r.d || {};
          if (r.res.ok && d.mode === "live" && typeof d.reply === "string") {
            history.push({ role: "user", content: text });
            history.push({ role: "assistant", content: d.reply, sig: d.sig });
            show(addMsg("ai", d.reply));
            status.textContent = t.answered;
            return;
          }
          var msg, end = false;
          if (d.mode === "off") { msg = d.reply || t.stopped; end = true; }
          else if (r.res.status === 429) { msg = d.reply || t.limit; end = true; }
          else if (r.res.status === 400 && d.error === "too_long") msg = t.tooLong;
          else msg = t.busy;
          show(addMsg("ai", msg, "note"));
          if (end) stop();
        })
        .catch(function () {
          clearTimeout(timer);
          slowOff();
          setBusy(false);
          show(addMsg("ai", t.offline, "note"));
        });
    }
  }

  function start() {
    var list = document.querySelectorAll(".ask-us");
    for (var i = 0; i < list.length; i++) init(list[i]);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
