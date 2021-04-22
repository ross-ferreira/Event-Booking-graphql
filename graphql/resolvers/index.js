const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");

// in await it always returns so dont need to add return after await
const events = async (eventIds) => {
  try {
    const events = await Event.find({
      _id: { $in: eventIds },
    });
    events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator),
      };
    });
    return events;
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
        return {
          ...event._doc,
          // need to convert id to a string from db
          _id: event._doc._id.toString(),
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
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
      createdEvent = {
        ...result._doc,
        // event.id will use mongoose to convert it automatimcally
        _id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      };
      const creator = await User.findById("6081a58cbb176c4e653c557d");
      if (!creator) {
        throw new Error("User not found");
      }
      creator.createdEvents.push(event);
      await creator.save();
      console.log(result);
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
};
