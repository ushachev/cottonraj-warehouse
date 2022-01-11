import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthProvider from '../components/AuthProvider.jsx';
import RequireAuth from '../components/RequireAuth.jsx';
import Login from '../pages/Login.jsx';
import Root from '../pages/Root.jsx';
import NotFound from '../pages/NotFound.jsx';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><Root /></RequireAuth>} />
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
