import React, { useState } from 'react';

const categories = [
  { id: 1, name: 'Donuts', emoji: '🍩' },
  { id: 2, name: 'Burger', emoji: '🍔' },
  { id: 3, name: 'Ice', emoji: '🍦' },
  { id: 4, name: 'Potato', emoji: '🍟' },
  { id: 5, name: 'Fuchka', emoji: '🍱' },
  { id: 6, name: 'Pizza', emoji: '🍕' },
  { id: 7, name: 'Hot dog', emoji: '🌭' },
  { id: 8, name: 'Chicken', emoji: '🍗' },
];

const CategorySection = () => {
  const [activeTab, setActiveTab] = useState(2); // Burger selected by default

  return (
    <section className="mt-2">
      <h2 className="text-xl font-bold mb-4 px-2">Explore Categories</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-[2rem] transition-all duration-300
              ${activeTab === cat.id 
                ? 'bg-white/80 border-2 border-[#FF6B4A]/30 shadow-lg scale-105' 
                : 'bg-white/30 border border-white/40 hover:bg-white/50 shadow-sm'}
            `}
          >
            <span className="text-2xl mb-2">{cat.emoji}</span>
            <span className={`text-xs font-semibold ${activeTab === cat.id ? 'text-[#FF6B4A]' : 'text-gray-500'}`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Section Filter (Popular/Recent) */}
      <div className="flex gap-8 mt-8 border-b border-gray-100 px-2">
        <button className="pb-3 text-lg font-bold border-b-2 border-[#FF6B4A] text-[#FF6B4A]">
          Popular
        </button>
        <button className="pb-3 text-lg font-medium text-gray-400 hover:text-gray-600 transition-colors">
          Recent
        </button>
      </div>
    </section>
  );
};

export default CategorySection;