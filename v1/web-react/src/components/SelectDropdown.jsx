import { useState, useEffect } from "react";

const SelectDropdown = ({
  fetchUrl,
  label,
  name,
  value,
  onChange,
}) => {
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

        const resultData = await res.json();

        if (Array.isArray(resultData)) {
          setData(resultData);
        } else {
          setData([]);
          console.warn("Expected array from backend but received:", resultData);
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
      <div className="flex items-center gap-2 text-purple-700 font-medium text-xs py-2">
        <div className="w-4 h-4 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading drivers list...</span>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
        <strong>Error loading dropdown:</strong> {err}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-5 w-fit">
      <label htmlFor={name} className="text-md font-medium text-slate-700">
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange} 
        className="w-fit px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
      >
        <option value="">Select Driver</option>
        {data.map((row) => {
          
          const id = row.DRIVERID || row.driverId || row.ID;
          const name = row.DRIVERNAME || row.driverName || row.NAME;

          return (
            <option key={id} value={id}>
              Driver #{id} - {name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectDropdown;
