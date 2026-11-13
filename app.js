/* Present-Service v2: accessible navigation, segmentation brief, opt-in delivery. */
(() => {
  "use strict";
  const config = Object.freeze(Object.assign({
    leadEndpoint: "", turnstileSiteKey: "", analyticsWebsiteId: ""
  }, window.PRESENT_SERVICE_CONFIG || {}));
  const $ = (selector, parent=document) => parent.querySelector(selector);

  function track(eventName) {
    // Analytics is optional, disabled until explicitly configured and legally reviewed.
    if (config.analyticsWebsiteId && window.umami && typeof window.umami.track === "function") {
      window.umami.track(eventName);
    }
  }
  if (config.analyticsWebsiteId && /^[a-f0-9-]{30,40}$/i.test(config.analyticsWebsiteId)) {
    const script = document.createElement("script");
    script.defer = true;
    script.src = "https://cloud.umami.is/script.js";
    script.dataset.websiteId = config.analyticsWebsiteId;
    document.head.appendChild(script);
  }

  const menuButton = $(".menu-toggle");
  const menu = $("#primary-nav");
  if (menuButton && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Otwórz menu");
    };
    menuButton.addEventListener("click", () => {
      const open = menuButton.getAttribute("aria-expanded") !== "true";
      menu.classList.toggle("is-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
    });
    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener("click", event => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const form = $("#campaign-form");
  if (!form) return;
  const channelField = $("#channel");
  const locationField = $("#location");
  const regionField = $("#regions-field");
  const cityField = $("#city-field");
  const cities = $("#cities");
  const regionInputs = [...form.querySelectorAll('input[name="voivodeship"]')];
  const result = $("#brief-result");
  const preview = $("#brief-preview");
  const emailLink = $("#send-email");
  const copyButton = $("#copy-brief");
  const editButton = $("#edit-brief");
  const sendDirectButton = $("#send-direct");
  const sendDirectStatus = $("#send-direct-status");
  const onlineContact = $("#online-contact");
  const contactEmail = $("#contact-email");
  const consent = $("#privacy-confirm");
  const turnstileContainer = $("#turnstile-widget");

  let currentBrief = "";
  let currentPayload = null;
  let turnstileToken = "";
  let turnstileWidgetId = null;
  let isSending = false;
  let completed = false;

  const requestedChannel = new URLSearchParams(window.location.search).get("kanal");
  if (requestedChannel && [...channelField.options].some(opt => opt.value === requestedChannel)) {
    channelField.value = requestedChannel;
  }

  document.querySelectorAll("[data-channel]").forEach(link => {
    link.addEventListener("click", () => {
      const channel = link.getAttribute("data-channel");
      if (channel && [...channelField.options].some(opt => opt.value === channel)) channelField.value = channel;
    });
  });

  function refreshRegions() {
    const selectRegions = locationField.value === "Wybrane województwa";
    const selectCities = locationField.value === "Wybrane miasta / regiony";
    regionField.hidden = !selectRegions;
    cityField.hidden = !selectCities;
    if (!selectRegions) regionInputs.forEach(input => { input.checked = false; });
    if (!selectCities) cities.value = "";
  }
  locationField.addEventListener("change", refreshRegions);
  refreshRegions();

  // Progressive enhancement: without JavaScript all fields and the ordinary mailto
  // brief remain available in one continuous form. With JS use three clear steps.
  const wizardPanels = [...form.querySelectorAll("[data-wizard-step]")];
  const wizardIndicators = [...form.querySelectorAll("[data-step-indicator]")];
  const wizardSummary = $("#wizard-summary");
  let currentStep = 1;

  function campaignTerritory() {
    if (locationField.value === "Wybrane województwa") {
      const selected = regionInputs.filter(input => input.checked).map(input => input.value);
      return selected.length ? selected.join(", ") : "Nie wybrano województw";
    }
    if (locationField.value === "Wybrane miasta / regiony") {
      return cities.value.trim() || "Nie wybrano lokalizacji";
    }
    return locationField.value;
  }

  function updateWizardSummary() {
    if (!wizardSummary) return;
    const fields = [
      ["Kanał", channelField.value || "Do ustalenia"],
      ["Wiek dziecka", $("#family-stage").value],
      ["Liczba dzieci", $("#child-count").value],
      ["Region", campaignTerritory()],
      ["Firma", $("#brand-name").value.trim() || "Do ustalenia"],
      ["Termin", $("#campaign-date").value || "Do ustalenia"],
      ["Budżet", $("#campaign-budget").value]
    ];
    wizardSummary.replaceChildren();
    for (const [label, value] of fields) {
      const row = document.createElement("div");
      row.className = "premium-summary-row";
      const title = document.createElement("small");
      title.textContent = label;
      const answer = document.createElement("strong");
      answer.textContent = value;
      row.append(title, answer);
      wizardSummary.append(row);
    }
  }

  function goToStep(nextStep, focus = true) {
    currentStep = Math.min(3, Math.max(1, nextStep));
    wizardPanels.forEach(panel => {
      panel.hidden = Number(panel.dataset.wizardStep) !== currentStep;
    });
    wizardIndicators.forEach(indicator => {
      const n = Number(indicator.dataset.stepIndicator);
      if (n === currentStep) indicator.setAttribute("aria-current", "step");
      else indicator.removeAttribute("aria-current");
      indicator.dataset.complete = String(n < currentStep);
    });
    if (currentStep === 3) updateWizardSummary();
    if (focus) {
      const heading = wizardPanels[currentStep - 1]?.querySelector("h4");
      heading?.focus({ preventScroll: true });
      form.scrollIntoView({ block: "start", behavior: "instant" });
    }
    track("brief_step_" + currentStep);
  }

  function validateAudience() {
    if (!channelField.value) {
      channelField.reportValidity();
      channelField.focus();
      return false;
    }
    if (locationField.value === "Wybrane województwa" && !regionInputs.some(input => input.checked)) {
      const hint = regionField.querySelector(".v2-field-hint");
      if (hint) {
        hint.textContent = "Wybierz przynajmniej jedno województwo.";
        hint.classList.add("v2-error");
      }
      regionInputs[0]?.focus();
      return false;
    }
    if (locationField.value === "Wybrane miasta / regiony" && !cities.value.trim()) {
      cities.setCustomValidity("Wpisz przynajmniej jedno miasto lub region.");
      cities.reportValidity();
      cities.setCustomValidity("");
      return false;
    }
    return true;
  }

  if (wizardPanels.length === 3 && wizardIndicators.length === 3) {
    form.classList.add("wizard-enhanced");
    goToStep(1, false);
    form.querySelectorAll("[data-wizard-next]").forEach(button => {
      button.addEventListener("click", () => {
        if (currentStep === 1 && !validateAudience()) return;
        goToStep(currentStep + 1);
      });
    });
    form.querySelectorAll("[data-wizard-back]").forEach(button => {
      button.addEventListener("click", () => goToStep(currentStep - 1));
    });
    regionInputs.forEach(input => input.addEventListener("change", () => {
      const hint = regionField.querySelector(".v2-field-hint");
      if (hint && regionInputs.some(checkbox => checkbox.checked)) {
        hint.classList.remove("v2-error");
        hint.textContent = "Możesz zaznaczyć kilka województw. Dostępność segmentów zostanie potwierdzona indywidualnie.";
      }
    }));
    locationField.addEventListener("change", () => {
      const hint = regionField.querySelector(".v2-field-hint");
      if (hint) hint.classList.remove("v2-error");
    });
  }

  form.addEventListener("focusin", () => {
    if (!form.dataset.started) {
      form.dataset.started = "true";
      track("brief_started");
    }
  });

  function line(label, value) {
    return label + ": " + (value || "do ustalenia");
  }

  function prepareBrief(data, territory) {
    return [
      "Dzień dobry,",
      "",
      "Proszę o przygotowanie informacji o możliwościach kampanii do rodzin z dziećmi w Polsce.",
      "",
      "WSTĘPNY BRIEF KAMPANII",
      line("Firma / marka", data.brand),
      line("Osoba kontaktowa", data.contactName),
      line("Adres do odpowiedzi", data.contactEmail),
      line("Kanał", data.channel),
      line("Etap życia / wiek dziecka", data.stage),
      line("Liczba dzieci", data.childCount),
      line("Wiek matki (opcjonalny)", data.parentAge),
      line("Geografia", territory),
      line("Planowany termin", data.campaignDate),
      line("Budżet orientacyjny", data.budget),
      line("Cel / dodatkowe informacje", data.goal),
      "",
      "Proszę o weryfikację dostępności grupy, zgodności kanału kontaktu z obowiązującymi przepisami i o przygotowanie indywidualnej oferty.",
      "",
      "Z poważaniem",
      data.contactName || ""
    ].join("\n");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!validateAudience()) {
      goToStep(1);
      validateAudience();
      return;
    }
    if (!form.reportValidity()) return;
    let territory = locationField.value;
    if (territory === "Wybrane województwa") {
      const values = regionInputs.filter(input => input.checked).map(input => input.value);
      if (!values.length) {
        regionField.querySelector(".v2-field-hint").textContent = "Wybierz przynajmniej jedno województwo.";
        regionField.querySelector(".v2-field-hint").classList.add("v2-error");
        regionInputs[0].focus();
        return;
      }
      territory = values.join(", ");
    } else if (territory === "Wybrane miasta / regiony") {
      if (!cities.value.trim()) {
        cities.setCustomValidity("Wpisz przynajmniej jedno miasto lub region.");
        cities.reportValidity();
        cities.setCustomValidity("");
        return;
      }
      territory = cities.value.trim();
    }
    const data = Object.fromEntries(new FormData(form).entries());
    const normalized = {
      brand: String(data.brand || "").trim(),
      channel: String(data.channel || "").trim(),
      stage: String(data.stage || "").trim(),
      childCount: String(data.childCount || "").trim(),
      parentAge: String(data.parentAge || "").trim(),
      territory,
      campaignDate: String(data.campaignDate || "").trim(),
      budget: String(data.budget || "").trim(),
      goal: String(data.goal || "").trim(),
      contactName: String(data.contactName || "").trim(),
      contactEmail: String(data.contactEmail || "").trim()
    };
    if (!normalized.channel) return channelField.focus();
    currentPayload = normalized;
    currentBrief = prepareBrief(normalized, territory);
    preview.value = currentBrief;
    const subject = "Zapytanie o kampanię" + (normalized.brand ? " – " + normalized.brand : "");
    emailLink.href = "mailto:marketing@present-service.pl?subject=" + encodeURIComponent(subject)
      + "&body=" + encodeURIComponent(currentBrief);
    form.hidden = true;
    result.hidden = false;
    result.querySelector("h3").setAttribute("tabindex", "-1");
    result.querySelector("h3").focus();
    copyButton.textContent = "Kopiuj treść zapytania";
    track("brief_completed");
    configureOnlineContact();
  });

  emailLink.addEventListener("click", () => track("email_draft_opened"));

  copyButton.addEventListener("click", async () => {
    if (!currentBrief) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentBrief);
      } else {
        preview.focus();
        preview.select();
        if (!document.execCommand("copy")) throw new Error("Kopiowanie niedostępne");
        preview.setSelectionRange(0, 0);
      }
      copyButton.textContent = "Skopiowano ✓";
      track("brief_copied");
    } catch {
      preview.focus();
      preview.select();
      copyButton.textContent = "Zaznacz tekst i skopiuj";
    }
  });

  editButton.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    goToStep(3);
  });

  // No direct delivery without a configured API endpoint AND anti-bot site key.
  const onlineEnabled = /^https:\/\//.test(config.leadEndpoint)
    && typeof config.turnstileSiteKey === "string" && config.turnstileSiteKey.length > 10;

  function configureOnlineContact() {
    onlineContact.hidden = !onlineEnabled || completed;
    if (!onlineEnabled || completed) return;
    const emailIsValid = contactEmail.checkValidity() && !!contactEmail.value.trim();
    if (!emailIsValid || !consent.checked) {
      sendDirectButton.disabled = true;
      sendDirectStatus.textContent = "Wysyłka bezpośrednia wymaga poprawnego e-maila i potwierdzenia zapoznania się z informacją o danych. Wróć do edycji, aby je uzupełnić.";
      return;
    }
    sendDirectStatus.textContent = "Potwierdź weryfikację antyspamową, aby wysłać zapytanie bezpośrednio.";
    if (!turnstileWidgetId && !turnstileContainer.dataset.initialized) {
      turnstileContainer.dataset.initialized = "true";
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => {
        if (!window.turnstile) return;
        turnstileWidgetId = window.turnstile.render(turnstileContainer, {
          sitekey: config.turnstileSiteKey,
          callback: token => { turnstileToken = token; sendDirectButton.disabled = false; sendDirectStatus.textContent = ""; },
          "expired-callback": () => { turnstileToken = ""; sendDirectButton.disabled = true; },
          "error-callback": () => { turnstileToken = ""; sendDirectButton.disabled = true; sendDirectStatus.textContent = "Nie udało się zweryfikować antyspamu. Możesz wysłać zapytanie e-mailem."; }
        });
      };
      script.onerror = () => { sendDirectStatus.textContent = "Weryfikacja antyspamowa niedostępna. Skorzystaj z przycisku e-mail."; };
      document.head.appendChild(script);
    }
  }

  sendDirectButton.addEventListener("click", async () => {
    if (!onlineEnabled || !currentPayload || !turnstileToken || isSending || completed) return;
    if (!contactEmail.checkValidity() || !contactEmail.value.trim() || !consent.checked) {
      sendDirectStatus.textContent = "Uzupełnij adres e-mail i potwierdź informację o danych.";
      return;
    }
    isSending = true;
    sendDirectButton.disabled = true;
    sendDirectStatus.textContent = "Wysyłanie zapytania…";
    try {
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 12000);
      let response;
      try {
        response = await fetch(config.leadEndpoint, {
          method: "POST",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.assign({}, currentPayload, {
            privacyConfirmed: true, challengeToken: turnstileToken,
            website: ""
          })),
          signal: abortController.signal
        });
      } finally {
        clearTimeout(timeout);
      }
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body.ok !== true) throw new Error("delivery-not-confirmed");
      completed = true;
      sendDirectStatus.textContent = "Dziękujemy! Serwer potwierdził przyjęcie wiadomości.";
      sendDirectButton.textContent = "Zapytanie przyjęte ✓";
      track("lead_received_by_server");
    } catch {
      sendDirectStatus.textContent = "Nie mamy potwierdzenia dostarczenia. Sprawdź skrzynkę przed ponowną próbą lub użyj opcji e-mail poniżej.";
      track("lead_delivery_error");
      if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
      turnstileToken = "";
      sendDirectButton.disabled = true;
    } finally {
      isSending = false;
    }
  });
})();
