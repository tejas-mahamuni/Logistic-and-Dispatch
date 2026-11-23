import React from 'react';

export const KpiCard = ({ label, value, subtext, highlight = false }) => {
  return (
    <div className={`card-v1 p-4 flex flex-col justify-between ${highlight ? 'border-amber-300 bg-amber-50/20' : ''}`}>
      <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </span>
      <div className="my-2">
        <span className={`text-2xl font-bold tracking-tight ${highlight ? 'text-amber-700' : 'text-slate-900'}`}>
          {value ?? '—'}
        </span>
      </div>
      {subtext && (
        <span className="text-xs text-slate-400 font-medium">
          {subtext}
        </span>
      )}
    </div>
  );
};
