import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { initDrawInteraction, stopDrawingOnEnter } from "../utils/drawHelpers";
import Modal from "./Modal";
import WaypointList from "./WaypointList";

const MapContainer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  useEffect(() => {
    // Initialize the map instance
    const mapInstance = new Map({
      target: mapRef.current, // Attach map to the container
      layers: [
        new TileLayer({ source: new OSM() }), // Base OSM layer
        new VectorLayer({ source: vectorSource }), // Layer for vector features
      ],
      view: new View({ center: [0, 0], zoom: 2 }), // Set initial center and zoom
    });

    setMap(mapInstance); // Store the map instance in state

    // Cleanup on unmount
    return () => {
      mapInstance.setTarget(null); // Detach the map from the DOM
      mapInstance.getInteractions().clear(); // Remove all interactions
      mapInstance.getLayers().clear(); // Remove all layers
    };
  }, []);

  const handleToggleDrawingMode = () => {
    if (!map) return;

    setIsDrawingMode((prevDrawingMode) => {
      const newDrawingMode = !prevDrawingMode; // Correctly toggle the drawing mode state

      if (newDrawingMode) {
        // Start drawing interaction
        const drawInteraction = initDrawInteraction(vectorSource, map);

        // Stop drawing on Enter key
        stopDrawingOnEnter(drawInteraction, (coordinates, type) => {
          setWaypoints((prevWaypoints) => [
            ...prevWaypoints,
            { type, coordinates },
          ]);
        });
      } else {
        // Clear interactions if drawing mode is turned off
        map.getInteractions().clear();
      }

      return newDrawingMode; // Update the state
    });
  };

  const handleInsertPolygon = (waypointIndex, position) => {
    if (!map) return;

    const draw = new Draw({
      source: vectorSource,
      type: "Polygon",
    });

    map.addInteraction(draw);

    draw.on("drawend", (event) => {
      const polygonCoordinates = event.feature.getGeometry().getCoordinates();
      setWaypoints((prevWaypoints) => {
        const newWaypoints = [...prevWaypoints];
        const insertIndex =
          position === "before" ? waypointIndex : waypointIndex + 1;
        newWaypoints.splice(insertIndex, 0, {
          type: "Polygon",
          coordinates: polygonCoordinates,
          connectedTo: waypointIndex, // Track connection
        });
        return newWaypoints;
      });
      setIsModalOpen(true);
      setModalContent(
        `Polygon inserted ${position} waypoint ${waypointIndex + 1}`
      );
      map.removeInteraction(draw);
    });
  };

  const handleWaypointHighlight = (index) => {
    setIsModalOpen(true);
    setModalContent(`Highlighted waypoint ${index + 1}`);
  };

  return (
    <div>
      <button
        onClick={handleToggleDrawingMode}
        className={`absolute z-10 top-4 right-4 text-white py-2 px-4 rounded ${
          isDrawingMode ? "bg-red-500" : "bg-blue-500"
        }`}
      >
        {isDrawingMode ? "Stop Drawing" : "Start Drawing Mode"}
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <p>{modalContent}</p>
      </Modal>

      <WaypointList
        waypoints={waypoints}
        handleInsertPolygon={handleInsertPolygon}
      />

      <div ref={mapRef} className="w-full h-screen"></div>
    </div>
  );
};

export default MapContainer;
