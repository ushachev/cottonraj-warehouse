import React from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import resources from './locales/index.js';
import App from './App.jsx';

const init = () => {
  i18n
    .use(initReactI18next)
    .init({
      lng: 'ru',
      debug: false,
      resources,
    });

  const vdom = (
    <App />
  );

  return vdom;
};

export default init;
