import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0e131f] text-[#dee2f4] antialiased selection:bg-[#4d8eff] selection:text-[#00285d]">
      <Navbar />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
