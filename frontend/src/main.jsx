import React from "react";
import ReactDOM from "react-dom/client";
import AppRouter from "./routes/AppRouter";
import "./index.css";
import MetaMaskAuth from "./Auth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppRouter />
);
