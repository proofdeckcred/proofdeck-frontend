import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { IS_DESKTOP_APP } from "./config";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css"; // Import the main App.css for global styles

if (IS_DESKTOP_APP || localStorage.getItem("pd_desktop_mode") === "1") {
  document.title = "ProofDeck Enterprise";
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
