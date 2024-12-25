import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SessionProvider } from './context/userSession.context';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SessionProvider>
        <div className="d-flex flex-column">
          <div className='sticky-top'>
            <Navbar />
          </div>
          <div className="flex-grow-1 min-vh-100">
            <App />
          </div>
          <div>
            <Footer />
          </div>
        </div>
      </SessionProvider>
    </BrowserRouter>
  </React.StrictMode>
);