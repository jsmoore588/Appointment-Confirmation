function findMatch(patterns) {
  const text = document.body?.innerText || "";

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return "";
}

function guessVehicle() {
  const metaVehicle =
    document.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    document.title;

  const bodyVehicle = findMatch([
    /\b((?:19|20)\d{2}\s+[A-Z][A-Za-z0-9-]+\s+[A-Z][A-Za-z0-9-]+(?:\s+[A-Z0-9-]+)*)\b/
  ]);

  return bodyVehicle || metaVehicle || "";
}

function guessName() {
  const bodyName = findMatch([
    /\bName[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/,
    /\bSeller[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/,
    /\bContact[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/
  ]);

  if (bodyName) {
    return bodyName;
  }

  const profileName =
    document.querySelector("[data-testid='profile_name_in_profile_page']")?.textContent ||
    document.querySelector("h1")?.textContent ||
    "";

  return profileName.trim();
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "APPOINTMENT_ENGINE_EXTRACT") {
    sendResponse({
      name: guessName(),
      vehicle: guessVehicle()
    });
  }
});
