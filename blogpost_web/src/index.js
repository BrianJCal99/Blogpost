import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import StoreProvider from "./redux/store/storeProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <div className="d-flex flex-column">
          <div className="sticky-top">
            <Navbar />
          </div>
          <div className="flex-grow-1 min-vh-100">
            <App />
          </div>
          <div>
            <Footer />
          </div>
          <div>
            <Toaster position="top-right" reverseOrder={false} />
          </div>
        </div>
      </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
