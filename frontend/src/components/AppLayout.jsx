import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F7FB] transition-colors duration-300">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all">
        <Navbar />
        <main className="pt-24 lg:pt-24 flex-1 flex flex-col p-4 md:p-7 lg:p-8 gap-7 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
