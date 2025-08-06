import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "@/assets/styles/globals.css";
import "@/assets/styles/spinner.css";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocale, messages, defaultLocale } from "@/lib/i18n";
import {
  RouterProvider,
} from "react-router";
import router from "@/lib/router";
import App from './App';

i18n
  .use(initReactI18next)
  .init({
    resources: messages,
    lng: getLocale(),
    fallbackLng: defaultLocale,
    interpolation: {
      escapeValue: false
    }
  });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App>
      <RouterProvider router={router} />
    </App>
  </StrictMode>,
)
