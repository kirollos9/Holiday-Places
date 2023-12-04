import { useRef, useState, useCallback, useEffect } from "react";
import Error from "./components/Error.jsx";
import Places from "./components/Places.jsx";
import Modal from "./components/Modal.jsx";
import DeleteConfirmation from "./components/DeleteConfirmation.jsx";
import logoImg from "./assets/logo.png";
import AvailablePlaces from "./components/AvailablePlaces.jsx";
import { updateUserPlaces ,fetchUserPlaces} from "../http.js";

function App() {
  const selectedPlace = useRef();
  useEffect(()=>{
    async function fetchingTheUserPlaces(){
      const d= await fetchUserPlaces();
      setUserPlaces(d);
    }
    fetchingTheUserPlaces();
  },[])

  const [userPlaces, setUserPlaces] = useState([]);
  const [errorUpdatingPlcaes, setErrorUpdatingPlcaes] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });
    try {
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      setUserPlaces(userPlaces);
      setErrorUpdatingPlcaes({
        message: error.message || "failed to update the places",
      });
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id
        )
      );
      try {
        await updateUserPlaces(
          userPlaces.filter((places) => places.id !== selectedPlace.current.id)
        );
      } catch (error) {
        setUserPlaces(userPlaces);
        setErrorUpdatingPlcaes({
          message: error.message || "failed to delete the places",
        });
      }

      setModalIsOpen(false);
    },
    [userPlaces]
  );
  function handleError() {
    setErrorUpdatingPlcaes(null);
  }
  return (
    <>
      <Modal open={errorUpdatingPlcaes} onClose={handleError}>
        {errorUpdatingPlcaes && (
          <Error
            title="An Error Occured"
            message={errorUpdatingPlcaes.message}
            onConfirm={handleError}
          ></Error>
        )}
      </Modal>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
