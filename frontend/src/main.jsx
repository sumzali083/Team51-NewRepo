import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import 'bootstrap/dist/css/bootstrap.min.css';

console.log('DEBUG: main.jsx is running');
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);