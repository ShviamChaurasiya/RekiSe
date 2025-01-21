import React, { useEffect } from "react";

const WaypointList = ({ waypoints = [], handleInsertPolygon }) => {
  useEffect(() => {
    console.log("Updated waypoints:", waypoints); // Debug log
  }, [waypoints]);

  return (
    <div className="absolute z-10 top-16 right-4 bg-white p-4 shadow-md rounded max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">Waypoints</h3>
      <ul className="space-y-2">
        {waypoints.map((wp, index) => (
          <li key={index} className="flex items-center justify-between">
            <button
              className="text-blue-500 px-2 py-1 mr-2 bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => handleInsertPolygon(index, "before")}
            >
              ▾
            </button>
            <span className="text-sm text-gray-700">{`WP${index + 1}: [${wp.coordinates[0].toFixed(
              2
            )}, ${wp.coordinates[1].toFixed(2)}]`}</span>
            <div className="flex space-x-2">
              <button
                className="text-xs text-white bg-green-500 px-3 py-1 rounded hover:bg-green-600"
                onClick={() => handleInsertPolygon(index, "before")}
              >
                Add Polygon Before
              </button>
              <button
                className="text-xs text-white bg-red-500 px-3 py-1 rounded hover:bg-red-600"
                onClick={() => handleInsertPolygon(index, "after")}
              >
                Add Polygon After
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WaypointList;
