import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CompanyInfo from './pages/CompanyInfo';
import SelectPixels from './pages/SelectPixels';
import ReviewPay from './pages/ReviewPay';
import Completion from './pages/Completion';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy/step1" element={<CompanyInfo />} />
        <Route path="/buy/step2" element={<SelectPixels />} />
        <Route path="/buy/step3" element={<ReviewPay />} />
        <Route path="/buy/complete" element={<Completion />} />
      </Routes>
    </HashRouter>
  );
}