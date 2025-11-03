import { motion, AnimatePresence } from "framer-motion";

export default function DataTable({ isLoading, data, columns, onEdit, onDelete, children }) {
  return (
    <div className="w-full">
      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-slate-600 dark:text-slate-400">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-12 text-center">
                    {children}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4 text-sm">
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {onEdit && (
                            <motion.button
                              onClick={() => onEdit(item)}
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Edit
                            </motion.button>
                          )}
                          {onDelete && (
                            <motion.button
                              onClick={() => onDelete(item.id)}
                              whileHover={{ scale: 1.05 }} 
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
                            >
                              Delete
                            </motion.button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (shown only on mobile) */}
      <div className="block lg:hidden">
        <AnimatePresence>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <span className="text-slate-600 dark:text-slate-400 text-sm">Loading records...</span>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-8">
              {children}
            </div>
          ) : (
            <div className="space-y-3">
              {data.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700"
                >
                  {/* Card Content */}
                  <div className="space-y-3">
                    {columns.map((col, colIndex) => (
                      <div key={col.key} className={`${colIndex === 0 ? 'border-b border-slate-100 dark:border-slate-700 pb-2 mb-2' : ''}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide min-w-0 flex-shrink-0 w-24">
                            {col.header}
                          </span>
                          <div className="text-sm text-slate-900 dark:text-slate-100 text-right flex-1 ml-3 min-w-0">
                            {col.render ? col.render(item) : (
                              <span className="break-words">{item[col.key]}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Action Buttons */}
                  {(onEdit || onDelete) && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="flex-1 px-3 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item.id)}
                          className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}