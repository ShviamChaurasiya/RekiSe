import React, { useEffect, useState } from "react";

const WaypointList = ({ waypoints = [], handleInsertPolygon, handleClearDrawings, polygons = [], handleGenerateData }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  useEffect(() => {
    console.log("Updated waypoints:", waypoints); // Debug log

    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [waypoints]);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const triggerPolygonDrawing = (index, position) => {
    const polygonButton = document.getElementById("polygon-drawing-button");
    if (polygonButton) {
      polygonButton.click();
      handleInsertPolygon(index, position);
    }
  };

  const calculateHeight = () => {
    const itemCount = waypoints.length + polygons.length;
    const baseHeight = 200; // Base height in pixels
    const itemHeight = 40; // Height per item in pixels
    const maxHeight = window.innerHeight * 0.9; // 90% of screen height
    return Math.min(baseHeight + itemCount * itemHeight, maxHeight);
  };

  return (
    <div className="absolute z-10 top-16 left-4 bg-white p-4 shadow-md rounded overflow-y-auto w-96" style={{ maxHeight: calculateHeight() }}>
      <h3 className="font-bold mb-2">Waypoints</h3>
      <ul className="space-y-2">
        {waypoints.map((wp, index) => (
          <li key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {`WP${index + 1}: [${wp.coordinates[0].toFixed(2)}, ${wp.coordinates[1].toFixed(2)}]`}
            </span>
            <div className="relative dropdown">
              <button
                className="text-blue-500 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                onClick={() => toggleDropdown(index)}
              >
                ▾
              </button>
              {dropdownOpen === index && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-lg z-20">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => triggerPolygonDrawing(index, "before")}
                  >
                    Add Polygon Before
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => triggerPolygonDrawing(index, "after")}
                  >
                    Add Polygon After
                  </button>
                </div>
              )}
            </div>
          </li>
        ))}
        {polygons.map((polygon, index) => (
          <li key={index} className="flex flex-col">
            <span className="text-sm text-gray-700">
              {`Poly${index + 1}`}
            </span>
            <ul className="ml-4">
              {polygon.coordinates.map((coord, i) => (
                <li key={i} className="text-xs text-gray-600">
                  {`[${coord[0].toFixed(2)}, ${coord[1].toFixed(2)}]`}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {(waypoints.length > 0 || polygons.length > 0) && (
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleClearDrawings}
            className="w-full text-white py-2 px-4 rounded bg-red-500"
          >
            Clear Drawings
          </button>
          <button
            onClick={handleGenerateData}
            className="w-full text-white py-2 px-4 rounded bg-blue-500"
          >
            Generate Data
          </button>
        </div>
      )}
    </div>
  );
};

export default WaypointList;
