import { Draw } from "ol/interaction";
import { Style, Stroke, Icon } from "ol/style";
import { Feature } from "ol";
import { LineString, Polygon } from "ol/geom";

// Initialize drawing interaction
export const initDrawInteraction = (vectorSource, map, type = "LineString") => {
  const draw = new Draw({
    source: vectorSource,
    type: type, // Drawing type (LineString or Polygon)
  });

  // Listen for the drawstart event
  draw.on("drawstart", (event) => {
    const feature = event.feature; // Feature being drawn
    console.log("Drawing started");

    // Listen for pointer clicks to log coordinates
    map.on("pointerdown", (e) => {
      const clickedCoordinate = map.getEventCoordinate(e.originalEvent);
      console.log("Clicked coordinate:", clickedCoordinate); // Log coordinate
    });

    // Clean up after draw ends
    draw.on("drawend", () => {
      console.log("Drawing completed");
      map.un("pointerdown"); // Remove pointerdown listener
    });
  });

  map.addInteraction(draw);
  return draw;
};

// Stop drawing with Enter key and dismiss points with ESC key
export const stopDrawingOnEnter = (drawInteraction, callback) => {
  drawInteraction.on("drawend", (event) => {
    const coordinates = event.feature.getGeometry().getCoordinates();
    callback(coordinates, drawInteraction.type_);
    alert("Drawing completed!"); // Notify user
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      drawInteraction.setActive(false); // Stop drawing mode completely
      document.removeEventListener("keydown", handleKeyDown);
    } else if (e.key === "Escape") {
      drawInteraction.abortDrawing(); // Dismiss every point clicked
      callback([], drawInteraction.type_); // Clear waypoints
      document.removeEventListener("keydown", handleKeyDown);
    }
  };

  document.addEventListener("keydown", handleKeyDown);
};

// Switch to polygon drawing mode
export const switchToPolygonDrawing = (vectorSource, map, coordinates, callback) => {
  const polygonCoordinates = [...coordinates, coordinates[0]]; // Ensure the polygon is closed
  const polygon = new Feature({
    geometry: new Polygon([polygonCoordinates]),
  });
  vectorSource.addFeature(polygon);
  callback(polygon);
};
