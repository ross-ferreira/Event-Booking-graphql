const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const { findById } = require("../../models/event");

const transformEvent = event =>{
  return {
    ...event._doc,
    // need to convert id to a string from db
    _id: event.id,
    date: new Date(event._doc.date).toISOString(),
    creator: user.bind(this, event.creator),
  };
}

// in await it always returns so dont need to add return after await
const events = async (eventIds) => {
  try {
    const events = await Event.find({
      _id: { $in: eventIds },
    });
    events.map((event) => {
      return transformEvent(event)
    });
    return events;
  } catch (err) {
    throw err;
  }
};

const singleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    return transformEvent(event)
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      // graphql will check to see if the value is a string/function and if function as in "createdEvents" it will call it
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  // events here is linked to events schema
  events: async () => {
    try {
      const events = await Event.find();
      // mapping over events to extract out the data needed as mongo will respond with metadata within the request
      return events.map((event) => {
        return transformEvent(event)
      });
    } catch (err) {
      throw err;
    }
  },
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          _id: booking.id,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        };
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args) => {
    // this Event is from the models schema
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      // creator needs to be store as an object id but mongoose can convert a string to an object id automatically
      creator: "6081a58cbb176c4e653c557d",
    });
    let createdEvent;
    // this "save" function is provided by mongoose - it will write the data into the mongodb db
    try {
      const result = await event.save();
      createdEvent = transformEvent(result)
      const creator = await User.findById("6081a58cbb176c4e653c557d");
      if (!creator) {
        throw new Error("User not found");
      }
      creator.createdEvents.push(event);
      await creator.save();
      return createdEvent;
    } catch (err) {
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({
        email: args.userInput.email,
      });

      if (existingUser) {
        throw new Error("User already exists");
      }
      // 12 rounds of salting is enough encryption
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });
      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });
    const booking = new Booking({
      user: "6081a58cbb176c4e653c557d",
      event: fetchedEvent,
    });
    const result = await booking.save();
    return {
      ...result._doc,
      id: result.id,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(result._doc.createdAt).toISOString(),
      updatedAt: new Date(result._doc.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = transformEvent(booking.event)
      await Booking.deleteOne({ _id: args.bookingId });
      return event
    } catch (err) {
      throw err;
    }
  },
};
