import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "./premises.scss";

import "mapbox-gl/dist/mapbox-gl.css";
import { useNavigate } from "react-router-dom";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A";

const PremisesCard = ({ premises }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-68.137343, 45.137451],
      zoom: 5,
    });

    const polygon = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [premises.area],
      },
    };

    map.current.on("load", () => {
      map.current.addSource("polygon", {
        type: "geojson",
        data: polygon,
      });

      map.current.addLayer({
        id: "polygon",
        type: "fill",
        source: "polygon",
        layout: {},
        paint: {
          "fill-color": "#0080ff",
          "fill-opacity": 0.5,
        },
      });

      map.current.fitBounds(polygon.geometry.coordinates[0], {
        padding: 20,
      });
    });

    return () => {
      map.current.remove();
    };
  }, [premises.area]);

  return (
    <div
      onClick={() => navigate(`/groups/${premises.id}`)}
      className="premises-card"
    >
      <div className="premises-card-header">{premises.name}</div>
      <div
        className="map-container"
        style={{ height: "60%" }}
        ref={mapContainerRef}
      />
      <div className="premises-card-body">
        <h3 className="premises-card-title">{premises.name}</h3>
        {/* Add other details as needed */}
      </div>
    </div>
  );
};

export default PremisesCard;
