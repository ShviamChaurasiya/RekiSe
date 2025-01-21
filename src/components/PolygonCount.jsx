import React from "react";

// Component to display the count of polygons
const PolygonCount = ({ count }) => {
  return (
    <div className="absolute z-10 bottom-4 left-4 bg-white p-4 shadow-md rounded">
      <h3 className="font-bold mb-2">Polygon Count</h3>
      <p className="text-sm text-gray-700">{count}</p>
    </div>
  );
};

export default PolygonCount;
