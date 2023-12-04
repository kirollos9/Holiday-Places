import { useState } from "react";
import Places from "./Places.jsx";
import { useEffect } from "react";
import { sortPlacesByDistance } from "../loc.js";
import Error from "./Error.jsx";
import { fetchAvailablePlaces } from "../../http.js";

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorr, setError] = useState();
  useEffect(() => {
    async function fetchPlaces() {
      setIsFetching(true);
      try {
        const places= await fetchAvailablePlaces();
        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces= sortPlacesByDistance(places,position.coords.latitude,position.coords.longitude);
          setAvailablePlaces(sortedPlaces);
          setIsFetching(false);
        });
      } catch (error) {
        setError({ message: error.message || "could not fetching the data " });
      }
      setIsFetching(false);

      
    }
    fetchPlaces();
  }, []);
  if (errorr) {
    return <Error title="An Error Ocurred" message={errorr.message}></Error>;
  }

  return (
    <Places
      title="Available Places"
      places={availablePlaces}
      loadingText="Fetching Places Data..."
      isLoading={isFetching}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}
