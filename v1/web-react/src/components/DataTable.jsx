import { useState, useEffect } from "react";

const DataTable = ({ title, fetchUrl, columns }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch(fetchUrl);

        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

        const result = await res.json();

        if (Array.isArray(result)) {
          setData(result);
        } else {
          setData([]);
          console.warn("Expected array from backend but got:", result);
        }
      } catch (error) {
        setErr(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUrl]);


  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-75">
        <div className="flex items-center gap-3 text-purple-700 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading data from database...</span>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <strong>Error loading table:</strong> {err}
        </div>
      </div>
    );
  }


  return (
    <div className="px-6 py-3">
      <h2 className="text-3xl font-times italic text-slate-800 mb-5">{title}</h2>

      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-purple-700 text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-s font-medium uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-slate-800">
            {!Array.isArray(data) || data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-sm text-gray-500 font-medium"
                >
                  No records found in database.
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-purple-50 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {row[col.accessor] !== null && row[col.accessor] !== undefined && row[col.accessor] !== ""
                        ? row[col.accessor]
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;