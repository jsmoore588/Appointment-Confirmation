const nameInput = document.getElementById("name");
const vehicleInput = document.getElementById("vehicle");
const timeInput = document.getElementById("time");
const emailInput = document.getElementById("email");
const advisorInput = document.getElementById("advisor");
const apiBaseUrlInput = document.getElementById("apiBaseUrl");
const openTabInput = document.getElementById("openTab");
const statusNode = document.getElementById("status");
const generateButton = document.getElementById("generate");

async function restoreSettings() {
  const storage = await chrome.storage.local.get([
    "apiBaseUrl",
    "advisor",
    "openTab",
    "draftName",
    "draftVehicle"
  ]);

  apiBaseUrlInput.value = storage.apiBaseUrl || "http://localhost:6767";
  advisorInput.value = storage.advisor || "Jude";
  openTabInput.checked = storage.openTab !== false;

  if (storage.draftName) {
    nameInput.value = storage.draftName;
  }

  if (storage.draftVehicle) {
    vehicleInput.value = storage.draftVehicle;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "APPOINTMENT_ENGINE_EXTRACT"
    });

    if (response?.name && !nameInput.value) {
      nameInput.value = response.name;
    }

    if (response?.vehicle && !vehicleInput.value) {
      vehicleInput.value = response.vehicle;
    }
  } catch (_error) {
    // Ignore pages where the content script is unavailable.
  }
}

function setStatus(message, tone = "") {
  statusNode.textContent = message;
  statusNode.dataset.tone = tone;
}

async function generateLink() {
  const payload = {
    name: nameInput.value.trim(),
    vehicle: vehicleInput.value.trim(),
    time: timeInput.value.trim(),
    email: emailInput.value.trim(),
    advisor: advisorInput.value.trim() || "Jude"
  };

  if (!payload.name || !payload.vehicle || !payload.time) {
    setStatus("Name, vehicle, and time are required.", "error");
    return;
  }

  const apiBaseUrl = apiBaseUrlInput.value.trim().replace(/\/$/, "");
  const endpoint = `${apiBaseUrl}/api/create-appointment`;

  generateButton.disabled = true;
  setStatus("Generating link...");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();
    await navigator.clipboard.writeText(data.url);
    await chrome.storage.local.set({
      apiBaseUrl,
      advisor: payload.advisor,
      openTab: openTabInput.checked,
      draftName: payload.name,
      draftVehicle: payload.vehicle
    });

    chrome.runtime.sendMessage({
      type: "APPOINTMENT_ENGINE_CREATED",
      url: data.url,
      open: openTabInput.checked
    });

    setStatus("Link copied — ready to send", "success");
  } catch (error) {
    console.error(error);
    setStatus("Unable to create link. Check the API base URL.", "error");
  } finally {
    generateButton.disabled = false;
  }
}

generateButton.addEventListener("click", generateLink);
restoreSettings();
