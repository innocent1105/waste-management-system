import React from 'react';
import { Search, Bell, ChevronDown, SlidersHorizontal } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex items-center justify-between w-full h-20 px-6 bg-white/40 backdrop-blur-md border border-white/40 rounded-3xl shadow-sm">
      {/* Search Bar Container */}
      <div className="flex items-center flex-1 max-w-xl relative">
        <Search className="absolute left-4 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search food..." 
          className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF6B4A]/20 transition-all placeholder:text-gray-400"
        />
        <button className="ml-3 p-3 bg-[#FF6B4A] text-white rounded-2xl hover:bg-[#ff5a35] transition-all shadow-md shadow-orange-100">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Profile & Notifications */}
      <div className="flex items-center gap-6 ml-4">
        <button className="relative p-2 text-gray-500 hover:text-[#FF6B4A] transition-colors">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F7F7F2]"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold">David Brown</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Premium Member</p>
          </div>
          <div className="relative group cursor-pointer">
            <img 
              src="https://i.pravatar.cc/150?u=david" 
              alt="User" 
              className="w-10 h-10 rounded-xl border-2 border-white object-cover shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 p-0.5 bg-white rounded-md shadow-sm">
              <ChevronDown size={10} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;