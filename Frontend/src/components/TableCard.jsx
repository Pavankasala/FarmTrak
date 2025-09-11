// TableCard.jsx
import React from "react";

export default function TableCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}
