import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Import all necessary stylesheets for the entire application
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./lib/button-spinner.js";
import "./styles/App.css"; // Main stylesheet for dashboard
import "./styles/Auth.css"; // Styles for Login/Signup
import "./styles/LandingPage.css"; // Styles for the new minimal landing page
import "./styles/VerifyPage.css"; // Styles for the new verification page
import "./styles/SupportPage.css"; // Styles for the support page

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Service Worker registration logic
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/sw.js")
//       .then((registration) => {
//         console.log("Service Worker registered: ", registration);
//       })
//       .catch((registrationError) => {
//         console.log("Service Worker registration failed: ", registrationError);
//       });
//   });
// }
