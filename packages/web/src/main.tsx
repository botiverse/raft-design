import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { registerPushServiceWorker, supportsPushNotifications } from "./utils/pushNotifications";
import { trackVisualViewport } from "./utils/visualViewport";

if (supportsPushNotifications()) {
  void registerPushServiceWorker();
}

// Pin #root to the visual viewport. Fixes iOS Safari focused-input lift and
// iOS PWA standalone bottom-gap issues. See visualViewport.ts for details.
trackVisualViewport();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
