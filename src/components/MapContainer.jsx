import React, { useEffect, useRef } from "react";
import "ol/ol.css"; // OpenLayers default styling
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";

const MapContainer = () => {
  const mapRef = useRef(null); // Reference to the map container div

  useEffect(() => {
    // Initialize the map
    const map = new Map({
      target: mapRef.current, // Target the div
      layers: [
        new TileLayer({
          source: new OSM(), // OpenStreetMap as the base layer
        }),
      ],
      view: new View({
        center: [0, 0], // Center the map at coordinates [0, 0]
        zoom: 2, // Initial zoom level
      }),
    });

    // Clean up the map on component unmount
    return () => map.setTarget(null);
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100vh", // Full height viewport for the map
      }}
    ></div>
  );
};

export default MapContainer;
