import { Draw } from "ol/interaction";
import { Style, Stroke, Icon } from "ol/style";
import { Feature } from "ol";
import { LineString } from "ol/geom";

// Initialize drawing interaction
export const initDrawInteraction = (vectorSource, map) => {
    const draw = new Draw({
      source: vectorSource,
      type: "LineString", // Drawing LineString by default
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
  
  
// Add directional arrows to LineString
const addArrowsToLine = (feature, vectorSource) => {
  const coordinates = feature.getGeometry().getCoordinates();
  coordinates.forEach((coord, index) => {
    if (index < coordinates.length - 1) {
      const arrow = new Feature({
        geometry: new LineString([coord, coordinates[index + 1]]),
      });
      arrow.setStyle(
        new Style({
          stroke: new Stroke({
            color: "#0000ff",
            width: 2,
          }),
          image: new Icon({
            src: "path/to/arrow-icon.png", // Replace with an arrow image URL
            scale: 0.1,
          }),
        })
      );
      vectorSource.addFeature(arrow);
    }
  });
};

// Stop drawing with Enter key
export const stopDrawingOnEnter = (drawInteraction, callback) => {
    drawInteraction.on("drawend", (event) => {
      const coordinates = event.feature.getGeometry().getCoordinates();
      callback(coordinates, drawInteraction.type_);
      alert("Drawing completed!"); // Notify user
    });
  
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        drawInteraction.setActive(false);
        // alert("You have stopped drawing."); // Confirmation for stopping drawing
        document.removeEventListener("keydown", handleKeyDown);
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  };
  
  
