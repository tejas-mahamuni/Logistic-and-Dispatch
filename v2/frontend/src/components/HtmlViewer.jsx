import React from 'react';
import { useParams } from 'react-router-dom';

const FORM_MAP = {
  'order': 'dispatch-order.html',
  'dispatch-order': 'dispatch-order.html',
  'customer': 'customer.html',
  'driver': 'driver.html',
  'vehicle': 'vehicle.html',
  'dispatch': 'dispatch-assignment.html',
  'dispatch-assignment': 'dispatch-assignment.html',
  'reports': 'reports.html',
};

export const HtmlViewer = ({ formFile }) => {
  const { formName } = useParams();

  let targetFile = formFile;
  if (!targetFile && formName) {
    targetFile = FORM_MAP[formName] || (formName.endsWith('.html') ? formName : `${formName}.html`);
  }

  const src = `/web-forms/${targetFile || 'index.html'}`;

  return (
    <div className="w-full h-full min-h-[calc(100vh-4.5rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <iframe
        src={src}
        title={targetFile}
        className="w-full flex-1 min-h-[calc(100vh-5rem)] border-0"
      />
    </div>
  );
};

export default HtmlViewer;
