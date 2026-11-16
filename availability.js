/* Present-Service: safe aggregate availability lookup.
   Never embeds customer records or fictitious availability figures in the browser. */
(() => {
  "use strict";
  const form = document.getElementById("campaign-form");
  const panel = document.getElementById("availability-panel");
  if (!form || !panel) return;

  const status = document.getElementById("availability-status");
  const figure = document.getElementById("availability-number");
  const detail = document.getElementById("availability-detail");
  const button = document.getElementById("availability-check");
  const config = window.PRESENT_SERVICE_CONFIG || {};
  const url = typeof config.availabilityEndpoint === "string" ? config.availabilityEndpoint.trim() : "";
  const enabled = /^https:\/\//i.test(url);
  const controls = ["channel", "family-stage", "child-count", "parent-age", "location", "cities"];
  const allowedLocations = new Set(["Cała Polska","Wybrane województwa","Wybrane miasta / regiony","Do ustalenia"]);
  const allowedChannels = new Set(["Direct mail","E-mailing","Mobile marketing","Sampling / Mamaklub","Kampania wielokanałowa","Potrzebuję doradztwa"]);
  const regionInputs = [...form.querySelectorAll('input[name="voivodeship"]')];
  const format = new Intl.NumberFormat("pl-PL");
  const defaultDetail = "Liczba kontaktów wymaga sprawdzenia w aktualnej bazie oraz weryfikacji uprawnień do wybranego kanału.";
  let controller = null;
  let requestSequence = 0;
  let timer = null;

  function hideNumber() { figure.hidden = true; figure.textContent = ""; }
  function showMessage(message, explanation=defaultDetail) {
    status.textContent = message;
    detail.textContent = explanation;
    hideNumber();
  }
  function selectedFilters() {
    const channel = document.getElementById("channel").value;
    const location = document.getElementById("location").value;
    const regions = location === "Wybrane województwa" ? regionInputs.filter(el => el.checked).map(el => el.value) : [];
    return {
      channel, stage: document.getElementById("family-stage").value,
      childCount: document.getElementById("child-count").value,
      parentAge: document.getElementById("parent-age").value,
      location, regions,
      cities: location === "Wybrane miasta / regiony" ? document.getElementById("cities").value.trim() : ""
    };
  }
  function isComplete(f) {
    return allowedChannels.has(f.channel) && allowedLocations.has(f.location)
      && f.channel !== "Potrzebuję doradztwa"
      && f.location !== "Do ustalenia"
      && (f.location !== "Wybrane województwa" || f.regions.length>0)
      && (f.location !== "Wybrane miasta / regiony" || f.cities.length>0);
  }
  async function check() {
    requestSequence++;
    const sequence = requestSequence;
    if(controller) controller.abort();
    controller = null;
    const filters = selectedFilters();
    if (!isComplete(filters)) {
      showMessage("Wybierz kanał i lokalizację, aby sprawdzić liczebność.");
      return;
    }
    if (!enabled) {
      showMessage("Weryfikacja liczebności na zapytanie.",
        "Automatyczne sprawdzanie zostanie włączone po bezpiecznym połączeniu z bazą danych. Możesz już przygotować i wysłać zapytanie z tymi kryteriami.");
      return;
    }
    controller = new AbortController();
    status.textContent = "Sprawdzamy aktualną liczebność segmentu…";
    detail.textContent = "Zapytanie dotyczy wyłącznie liczby dopasowań, bez danych osób.";
    hideNumber();
    const timeout = setTimeout(() => controller?.abort(), 8000);
    try {
      const response = await fetch(url, {
        method: "POST", mode: "cors", cache: "no-store",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(filters), signal: controller.signal
      });
      if(!response.ok) throw new Error("server unavailable");
      const data = await response.json();
      if(sequence !== requestSequence) return;
      if(!data || data.ok !== true || data.type !== "aggregate" ||
         !Number.isSafeInteger(data.count) || data.count<0 ||
         typeof data.asOf !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data.asOf)) throw new Error("invalid response");
      if(data.suppressed === true) {
        showMessage("Liczebność segmentu wymaga indywidualnej weryfikacji.",
          "Dla tego zestawu kryteriów nie publikujemy liczby. Skontaktuj się z zespołem.");
        return;
      }
      figure.textContent = format.format(data.count);
      figure.hidden = false;
      status.textContent = "Dopasowane rekordy w bazie";
      detail.textContent = "Stan danych: " + data.asOf + ". Liczba orientacyjna; możliwość legalnego wykorzystania i dostępność dla kampanii wymagają potwierdzenia.";
    } catch(e) {
      if(sequence !== requestSequence) return;
      showMessage("Nie można teraz potwierdzić liczebności.",
        "Nie podajemy szacunków bez danych z systemu. Możesz wysłać zapytanie, a zespół sprawdzi dostępność.");
    } finally {
      clearTimeout(timeout);
    }
  }
  function refresh() {
    if(timer) clearTimeout(timer);
    requestSequence++;
    if(controller) controller.abort();
    const filters = selectedFilters();
    if(!isComplete(filters)) {
      showMessage("Wybierz kanał i lokalizację, aby sprawdzić liczebność.");
      button.disabled = true;
      return;
    }
    button.disabled = !enabled;
    if(!enabled) {
      showMessage("Weryfikacja liczebności na zapytanie.",
        "W tej wersji nie ma połączenia z rzeczywistą bazą. Przygotuj brief, aby otrzymać potwierdzenie od zespołu.");
      return;
    }
    showMessage("Parametry zmienione — sprawdź ponownie.");
  }
  button.addEventListener("click", check);
  form.addEventListener("change", event => {
    if(controls.includes(event.target.id) || event.target.name === "voivodeship") refresh();
  });
  form.addEventListener("input", event => {
    if(event.target.id === "cities") refresh();
  });
  document.querySelectorAll("[data-demo-example]").forEach(el => {
    el.addEventListener("click", () => { timer = setTimeout(refresh, 0); });
  });
  refresh();
})();
