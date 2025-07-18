import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Popup from "@/pages/Popup";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider>
            <Popup />
        </ThemeProvider>
    </React.StrictMode>
); 