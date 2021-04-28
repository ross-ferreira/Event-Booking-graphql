const DataLoader = require("dataloader");

const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helpers/date");

const eventLoader = new DataLoader((eventIds) => {
  // it will group all the requests for eventIds together
  return events(eventIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({ _id: { $in: userIds } });
});

// in await it always returns so dont need to add return after await
const events = async (eventIds) => {
  try {
    // We use sort because we arent getting the correct order of IDS from dataloader
    const events = await Event.find({ _id: { $in: eventIds } });
    events.sort((a, b) => {
      // will sort array by comparing indexes
      return (
        eventsIds.indexOf(a._id.toString()) -
        eventsIds.indexOf(b._id.toString())
      );
    });
    return events.map((event) => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async (eventId) => {
  try {
    // const event = await Event.findById(eventId); !BEFORE DATA LOADER!
    const event = await eventLoader.load(eventId.toString());
    // return transformEvent(event);!BEFORE DATA LOADER!
    return event;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    // const user = await User.findById(userId); !BEFORE DATALOADER!
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
      // graphql will check to see if the value is a string/function and if function as in "createdEvents" it will call it
      // createdEvents: events.bind(this, user._doc.createdEvents),!BEFORE DATA LOADER!
      createdEvents: () => eventLoader.loadMany(user._doc.createdEvents),
    };
  } catch (err) {
    throw err;
  }
};

const transformEvent = (event) => {
  return {
    ...event._doc,
    // need to convert id to a string from db
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};
const transformBooking = (booking) => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;
// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;
