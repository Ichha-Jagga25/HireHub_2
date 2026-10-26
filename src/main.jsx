import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import App from './App.jsx';
import './styles/theme.css';
import './styles/global.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/forms.css';
import './styles/dashboards.css';
import './styles/dashboard-redesign.css';
import './styles/responsive.css';
import './styles/forest-gold.css';
import './styles/upskill.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <App />
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
