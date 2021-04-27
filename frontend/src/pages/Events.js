import React, { useEffect, useState, useContext } from "react";

import Backdrop from "../components/Backdrop/Backdrop";
import Modal from "../components/Modal/Modal";

import AuthContext from "../context/auth-context";

import "./Events.css";

const EventsPage = () => {
  const authContext = useContext(AuthContext);
  const [creating, setCreating] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [events, setEvents] = useState([]);

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
              creator {
                _id
                email
              }
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
        fetchEvents();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modalCancelHandler = () => {
    setCreating(false);
  };

  const fetchEvents = () => {
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
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const eventList = events.map((event) => {
    return (
      <li key={event._id} className="events__list-item">
        {event.title}
      </li>
    );
  });
  return (
    <>
      {creating && <Backdrop />}
      {creating && (
        <Modal
          title="Add Event"
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
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
      {authContext.token && (
        <div className="events-control">
          <p>Share your own Events!</p>
          <button className="btn" onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      <ul className="events__list">{eventList}</ul>
    </>
  );
};

export default EventsPage;
