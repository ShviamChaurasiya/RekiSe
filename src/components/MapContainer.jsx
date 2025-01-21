import React, { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Draw } from "ol/interaction";
import { initDrawInteraction, stopDrawingOnEnter, switchToPolygonDrawing } from "../utils/drawHelpers";
import Modal from "./Modal";
import WaypointList from "./WaypointList";
import { toLonLat } from "ol/proj";
import { Feature } from "ol";
import { LineString } from "ol/geom";

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

  const handleToggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode);
  }

  const handleTogglePolygonDrawingMode = () => {
    setIsPolygonDrawingMode(!isPolygonDrawingMode);
    setIsWaypointCreationPaused(true);
  }

  const handleInsertPolygon = (index, position) => {
    setIsPolygonDrawingMode(true);
    setPolygons((prevPolygons) => [
      ...prevPolygons,
      { id: `poly${prevPolygons.length + 1}`, coordinates: [] },
    ]);
  }

  const handleClearDrawings = () => {
    vectorSource.clear();
    setWaypoints([]);
    setPolygons([]);
    setIsDrawingMode(false); // Stop drawing mode
    setIsPolygonDrawingMode(false); // Stop polygon drawing mode
    setIsWaypointCreationPaused(false); // Resume waypoint creation
  }

  const handleGenerateData = () => {
    const data = {
      waypoints,
      polygons,
    };
    console.log("Generated Data:", data);
    alert("Data generated! Check the console for details.");
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
          setPolygonCount(prevCount => prevCount + 1); // Increment polygon count
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
        <p>{modalContent}</p>
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
