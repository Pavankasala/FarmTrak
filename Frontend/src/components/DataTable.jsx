import { motion, AnimatePresence } from "framer-motion";

export default function DataTable({ isLoading, data, columns, onEdit, onDelete, children }) {
  return (
    <div className="overflow-x-auto">
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
                    <td key={col.key} className="px-6 py-4">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {onEdit && (
                           <motion.button
                            onClick={() => onEdit(item)}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium shadow-sm"
                          >
                            Edit
                          </motion.button>
                        )}
                        {onDelete && (
                          <motion.button
                            onClick={() => onDelete(item.id)}
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium shadow-sm"
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
  );
}