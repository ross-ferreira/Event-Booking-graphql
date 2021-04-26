const Event = require("../../models/event");
const User = require("../../models/user");

const {transformEvent, } = require("./merge");


module.exports = {
  // events here is linked to events schema
  events: async () => {
    try {
      const events = await Event.find();
      // mapping over events to extract out the data needed as mongo will respond with metadata within the request
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (err) {
      throw err;
    }
  },
  createEvent: async (args,req) => {
    if(!req.isAuth){
      throw new Error('Unathenticated!')
    }
    // this Event is from the models schema
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      // creator needs to be store as an object id but mongoose can convert a string to an object id automatically
      creator: req.userId,
    });
    let createdEvent;
    // this "save" function is provided by mongoose - it will write the data into the mongodb db
    try {
      const result = await event.save();
      createdEvent = transformEvent(result);
      const creator = await User.findById(req.userId);
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
};
