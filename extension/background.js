chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "APPOINTMENT_ENGINE_CREATED" && message.url && message.open) {
    chrome.tabs.create({ url: message.url });
  }
});
