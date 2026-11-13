(() => {
  "use strict";

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#primary-nav");

  if (menuButton && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Otwórz menu");
    };
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menu.classList.toggle("is-open", !isOpen);
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Otwórz menu" : "Zamknij menu");
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        closeMenu();
        menuButton.focus();
      }
    });
    document.addEventListener("click", e => {
      if (!menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu();
    });
  }

  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.querySelector("#campaign-form");
  if (!form) return;

  const channelField = form.querySelector("#channel");
  // Preselect the appropriate service when arriving from a service detail page.
  const requestedChannel = new URLSearchParams(window.location.search).get("kanal");
  if (requestedChannel && channelField && [...channelField.options].some(option => option.value === requestedChannel)) {
    channelField.value = requestedChannel;
  }
  const result = document.querySelector("#brief-result");
  const preview = document.querySelector("#brief-preview");
  const sendEmailLink = document.querySelector("#send-email");
  const copyButton = document.querySelector("#copy-brief");
  const editButton = document.querySelector("#edit-brief");

  document.querySelectorAll("[data-channel]").forEach(link => {
    link.addEventListener("click", () => {
      const channel = link.getAttribute("data-channel");
      if (channel && channelField) channelField.value = channel;
    });
  });

  let currentBrief = "";

  form.addEventListener("submit", e => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const brand = String(data.get("brand") || "").trim();
    const channel = String(data.get("channel") || "").trim();
    const stage = String(data.get("stage") || "").trim();
    const location = String(data.get("location") || "").trim();
    const goal = String(data.get("goal") || "").trim();

    if (!channel) {
      channelField.focus();
      return;
    }

    const lines = [
      "Dzień dobry,",
      "",
      "Proszę o kontakt w sprawie możliwości przygotowania kampanii marketingowej dla rodzin z dziećmi.",
      "",
      "Wstępny brief:",
      "Firma / marka: " + (brand || "do ustalenia"),
      "Preferowany kanał: " + channel,
      "Grupa docelowa: " + stage,
      "Zasięg geograficzny: " + location,
      "Cel kampanii / dodatkowe informacje: " + (goal || "do ustalenia"),
      "",
      "Proszę o informację o dostępnych rozwiązaniach i dalszych krokach.",
      "",
      "Z poważaniem"
    ];

    currentBrief = lines.join("\n");
    preview.value = currentBrief;

    const subject = "Zapytanie o kampanię marketingową" + (brand ? " – " + brand : "");
    const mailto = "mailto:marketing@present-service.pl?subject="
      + encodeURIComponent(subject) + "&body=" + encodeURIComponent(currentBrief);

    sendEmailLink.setAttribute("href", mailto);
    form.hidden = true;
    result.hidden = false;
    result.querySelector("h3").setAttribute("tabindex", "-1");
    result.querySelector("h3").focus();
    copyButton.textContent = "Kopiuj treść zapytania";
  });

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
    } catch (_) {
      copyButton.textContent = "Zaznacz tekst powyżej i skopiuj";
      preview.focus();
      preview.select();
    }
  });

  editButton.addEventListener("click", () => {
    result.hidden = true;
    form.hidden = false;
    channelField.focus();
  });
})();
