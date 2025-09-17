import React from "react";

export default function TableCard({ title, children, className = "", hideTitle = false }) {
  return (
    <div className={`bg-light-card dark:bg-dark-card rounded-2xl shadow-md border border-light-border dark:border-dark-border w-full ${className}`}>
      {!hideTitle && title && (
        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text p-4 border-b border-light-border dark:border-dark-border">
          {title}
        </h3>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}