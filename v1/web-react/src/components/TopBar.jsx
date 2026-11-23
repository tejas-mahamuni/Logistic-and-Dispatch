// import React from 'react';
import { RotateCcw } from "lucide-react";

const TopBar = ({ title, desc, role }) => {
  return (
    <header className="bg-purple-800 shadow-lg border-b-8 border-purple-400 rounded-lg m-2">
      <div className="px-6 py-2 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider font-sans">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-purple-200 mt-1 font-medium">
            {desc}
          </p>
        </div>
        <div className="flex gap-5">
          <h4
            className={`text-[15px] text-center text-white bg-white/20 font-bold border-2 border-purple-400 rounded-full uppercase px-3 py-1.5`}
          >
            {role}
          </h4>
          <button
            type="button"
            className={`inline-flex items-center text-white bg-white/20 font-bold border-2 border-purple-400 rounded-full uppercase px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:outline-none gap-2 transition-all duration-300 ease-in-out hover:bg-purple-700 hover:scale-105 active:scale-95 group`}
          >
            <RotateCcw className="transition-transform duration-500 ease-in-out group-hover:rotate-360" />
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
