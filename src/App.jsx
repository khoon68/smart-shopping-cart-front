import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css'
import Home from './pages/Home'
import Setting from './pages/Setting'
import PaymentDesk from './pages/PaymentDesk'
import Cart from './pages/Cart'

function App() {

  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/setting" element={<Setting/>}></Route>
          <Route path="/payment-desk" element={<PaymentDesk/>}></Route>
          <Route path="/cart" element={<Cart/>}></Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App
