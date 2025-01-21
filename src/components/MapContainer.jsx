import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { initDrawInteraction, stopDrawingOnEnter } from "../utils/drawHelpers";
import Modal from "./Modal";
import WaypointList from "./WaypointList";
import { toLonLat } from "ol/proj";

const MapContainer = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [vectorSource] = useState(new VectorSource());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [polygons, setPolygons] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isPolygonDrawingMode, setIsPolygonDrawingMode] = useState(false);
  const [isWaypointCreationPaused, setIsWaypointCreationPaused] = useState(false);

  // Toggle drawing mode
  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  }

  // Toggle polygon drawing mode
  const handleTogglePolygonDrawingMode = () => {
    setIsPolygonDrawingMode(!isPolygonDrawingMode);
    setIsWaypointCreationPaused(true);
  }

  // Insert a new polygon
  const handleInsertPolygon = (index, position) => {
    setIsPolygonDrawingMode(true);
    setPolygons((prevPolygons) => [
      ...prevPolygons,
      { id: `poly${prevPolygons.length + 1}`, coordinates: [] },
    ]);
  }

  // Clear all drawings
  const handleClearDrawings = () => {
    vectorSource.clear();
    setWaypoints([]);
    setPolygons([]);
    setIsDrawingMode(false); // Stop drawing mode
    setIsPolygonDrawingMode(false); // Stop polygon drawing mode
    setIsWaypointCreationPaused(false); // Resume waypoint creation
  }

  // Generate data and show in modal
  const handleGenerateData = () => {
    setModalContent(
      <div>
        <h3 className="font-bold mb-2">Generated Data</h3>
        <div className="bg-gray-100 p-4 rounded">
          <h4 className="font-semibold">Waypoints:</h4>
          <ul className="list-disc pl-5">
            {waypoints.map((wp, index) => (
              <li key={index} className="mb-2">
                <span className="font-medium">WP{index + 1}:</span> [{wp.coordinates[0].toFixed(2)}, {wp.coordinates[1].toFixed(2)}]
              </li>
            ))}
          </ul>
          <h4 className="font-semibold mt-4">Polygons:</h4>
          <ul className="list-disc pl-5">
            {polygons.map((polygon, index) => (
              <li key={index} className="mb-2">
                <span className="font-medium">Poly{index + 1}:</span>
                <ul className="list-disc pl-5">
                  {polygon.coordinates.map((coord, i) => (
                    <li key={i}>
                      [{coord[0].toFixed(2)}, {coord[1].toFixed(2)}]
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
    setIsModalOpen(true);
  }

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

  useEffect(() => {
    let drawInteraction;

    if (map && isDrawingMode) {
      drawInteraction = initDrawInteraction(vectorSource, map);
      stopDrawingOnEnter(drawInteraction, (coordinates) => {
        if (coordinates) {
          setWaypoints((prevWaypoints) => [
            ...prevWaypoints,
            { coordinates },
          ]);
        } else {
          setWaypoints([]); // Clear waypoints if ESC key is pressed
        }
        setIsDrawingMode(false); // Stop drawing mode when drawing ends or Enter key is pressed
      });
    }

    if (map && isPolygonDrawingMode) {
      drawInteraction = initDrawInteraction(vectorSource, map, "Polygon");
      stopDrawingOnEnter(drawInteraction, (coordinates) => {
        if (coordinates) {
          setPolygons((prevPolygons) => {
            const lastPolygon = prevPolygons[prevPolygons.length - 1];
            const updatedCoordinates = [...lastPolygon.coordinates, coordinates];
            const updatedPolygon = { ...lastPolygon, coordinates: updatedCoordinates };
            return [...prevPolygons.slice(0, -1), updatedPolygon];
          });
        }
        setIsPolygonDrawingMode(false); // Stop polygon drawing mode when drawing ends or Enter key is pressed
        setIsWaypointCreationPaused(false); // Resume waypoint creation
      });
    }

    return () => {
      if (drawInteraction) {
        map.removeInteraction(drawInteraction);
      }
    };
  }, [map, isDrawingMode, isPolygonDrawingMode]);

  useEffect(() => {
    if (map && isDrawingMode && !isWaypointCreationPaused) {
      const handleMapClick = (event) => {
        const coordinates = toLonLat(map.getEventCoordinate(event.originalEvent));
        setWaypoints((prevWaypoints) => [
          ...prevWaypoints,
          { coordinates },
        ]);
      };

      map.on("click", handleMapClick);

      return () => {
        map.un("click", handleMapClick);
      };
    }
  }, [map, isDrawingMode, isWaypointCreationPaused]);

  useEffect(() => {
    if (map && isPolygonDrawingMode) {
      const handleMapClick = (event) => {
        const coordinates = toLonLat(map.getEventCoordinate(event.originalEvent));
        setPolygons((prevPolygons) => {
          const lastPolygon = prevPolygons[prevPolygons.length - 1];
          const updatedCoordinates = [...lastPolygon.coordinates, coordinates];
          const updatedPolygon = { ...lastPolygon, coordinates: updatedCoordinates };
          return [...prevPolygons.slice(0, -1), updatedPolygon];
        });
      };

      map.on("click", handleMapClick);

      return () => {
        map.un("click", handleMapClick);
      };
    }
  }, [map, isPolygonDrawingMode]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setWaypoints([]); // Clear waypoints if ESC key is pressed
      } else if (event.key === "Enter") {
        setIsDrawingMode(false); // Stop drawing mode if Enter key is pressed
        setIsPolygonDrawingMode(false); // Stop polygon drawing mode if Enter key is pressed
        setIsWaypointCreationPaused(false); // Resume waypoint creation
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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

      <button
        id="polygon-drawing-button"
        onClick={handleTogglePolygonDrawingMode}
        className="hidden"
      >
        {isPolygonDrawingMode ? "Stop Polygon Drawing" : "Start Polygon Drawing"}
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>

      <WaypointList
        waypoints={waypoints}
        polygons={polygons}
        handleInsertPolygon={handleInsertPolygon}
        handleClearDrawings={handleClearDrawings}
        handleGenerateData={handleGenerateData}
      />

      <div ref={mapRef} className="w-full h-screen"></div>
    </div>
  );
};

export default MapContainer;
