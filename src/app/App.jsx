import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AuthProvider from '../components/AuthProvider.jsx';
import RequireAuth from '../components/RequireAuth.jsx';
import Login from '../routes/Login.jsx';
import Root from '../routes/Root.jsx';
import NotFound from '../routes/NotFound.jsx';
import Products from '../routes/Products.jsx';
import Purchases from '../routes/Purchases.jsx';
import NewPurchase from '../routes/NewPurchase.jsx';
import Suppliers from '../routes/Suppliers.jsx';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RequireAuth><Root /></RequireAuth>}>
          <Route path="products" element={<Products />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/new" element={<NewPurchase />} />
          <Route path="suppliers" element={<Suppliers />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
