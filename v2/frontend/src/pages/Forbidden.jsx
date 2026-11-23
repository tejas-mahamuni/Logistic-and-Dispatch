import React from 'react';
import { Link } from 'react-router-dom';

export const Forbidden = () => {
  return (
    <div className="card-v1 p-12 text-center max-w-lg mx-auto my-16">
      <h1 className="text-3xl font-bold text-slate-800 heading-v1 mb-2">
        Access Restricted (403)
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Your current role does not have permission to view or manage resources in this section.
      </p>
      <Link
        to="/"
        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
      >
        Return to My Dashboard
      </Link>
    </div>
  );
};
