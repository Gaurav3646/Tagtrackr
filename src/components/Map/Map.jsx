import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { db } from "../../firebase";
import { doc } from "firebase/firestore";
import { onSnapshot } from "firebase/firestore";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.scss";

const Map = ({ userId }) => {
  const mapContainer = useRef(null);
  const [user, setUser] = useState(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(true);
  const docRef = doc(db, "user_locations", userId);

  useEffect(() => {
    const unsub = onSnapshot(docRef, (doc) => {
      setUser(doc.data());
      console.log("Current data: ", doc.data());
      setLoading(false);
    });

    return () => unsub(); // Unsubscribe when component unmounts
  }, []);

  useEffect(() => {
    if (!loading && mapContainer.current && user) {
      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9uYXNzY2htZWR0bWFubiIsImEiOiJjam54ZmM5N3gwNjAzM3dtZDNxYTVlMnd2In0.ytpI7V7w7cyT1Kq5rT9Z1A";

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/jonasschmedtmann/cjvi9q8jd04mi1cpgmg7ev3dy",
        center: [user.longitude, user.latitude],
        zoom: 12,
      });

      const newMarker = new mapboxgl.Marker()
        .setLngLat([user.longitude, user.latitude])
        .addTo(newMap);

      setMap(newMap);
      setMarker(newMarker);

      new mapboxgl.Popup({
        offset: 0,
      })
        .setLngLat([user.longitude, user.latitude])
        .setHTML(`<p>My Location</p>`)
        .addTo(newMap);

      // Clean up on unmount
      return () => {
        newMap.remove();
      };
    }
  }, [loading]);

  useEffect(() => {
    if (!loading && map && marker) {
      map.setCenter([user.longitude, user.latitude]);
      marker.setLngLat([user.longitude, user.latitude]);
    }
  }, [loading, user, map, marker]);

  return <div ref={mapContainer} id="map" className="map"></div>;
};

export default Map;
