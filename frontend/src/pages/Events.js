import React, { useEffect, useState, useContext } from "react";

import Backdrop from "../components/Backdrop/Backdrop";
import Modal from "../components/Modal/Modal";
import EventList from "../components/Events/EventsList/EventsList";
import Spinner from "../components/Spinner/Spinner";

import AuthContext from "../context/auth-context";

import "./Events.css";

const EventsPage = () => {
  const authContext = useContext(AuthContext);
  const [creating, setCreating] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const startCreateEventHandler = () => {
    setCreating(true);
  };

  const modalConfirmHandler = () => {
    setCreating(false);

    if (
      formValues.title.trim().length === 0 ||
      formValues.price <= 0 ||
      formValues.date.trim().length === 0 ||
      formValues.description.trim().length === 0
    ) {
      return;
    }

    const requestBody = {
      query: `
          mutation {
            createEvent(eventInput: {title: "${formValues.title}", description: "${formValues.description}", price: ${formValues.price}, date: "${formValues.date}"}) {
              _id
              title
              description
              date
              price
            }
          }
        `,
    };

    const token = authContext.token;

    fetch("http://localhost:9000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        const updatedEvents = [...events];
        updatedEvents.push({
          _id: resData.data.createEvent._id,
          title: resData.data.createEvent.title,
          description: resData.data.createEvent.description,
          date: resData.data.createEvent.date,
          price: resData.data.createEvent.price,
          creator: {
            _id: authContext.userId,
          },
        });
        setEvents(updatedEvents);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modalCancelHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const fetchEvents = () => {
    setIsLoading(true);
    const requestBody = {
      query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
              }
            }
          }
        `,
    };

    fetch("http://localhost:9000/graphql", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Failed!");
        }
        return res.json();
      })
      .then((resData) => {
        const events = resData.data.events;
        setEvents(events);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  };

  const showDetailHandler = (eventId) => {
    const selectedEvent = events.find((e) => e._id === eventId);
    setSelectedEvent(selectedEvent);
  };
  const bookEventHandler = () => {};

  return (
    <>
      {creating || (selectedEvent && <Backdrop />)}
      {creating && (
        <Modal
          title="Add Event"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
          confirmText="Confirm"
        >
          <form>
            <div className="form-control">
              <label htmlFor="title">Title</label>
              <input
                name="title"
                type="text"
                id="title"
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label htmlFor="price">Price</label>
              <input
                name="price"
                type="number"
                id="price"
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input
                name="date"
                type="datetime-local"
                id="date"
                onChange={handleInputChange}
              />
            </div>
            <div className="form-control">
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                id="description"
                rows="4"
                onChange={handleInputChange}
              />
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        <Modal
          title={selectedEvent.title}
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={bookEventHandler}
          confirmText="Book"
        >
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{" "}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {authContext.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={authContext.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </>
  );
};

export default EventsPage;
