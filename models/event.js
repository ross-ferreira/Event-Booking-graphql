const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// need to make sure the DB schema matches the Graphql Schema

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    // there is no "float" so will just be Number
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  creator: {
    // Just storing the list of event ids created
    type: Schema.Types.ObjectId,
    // this allows a relation to be setup between 2 models- will help allow mongoose to automatically merge data
    ref: "User",
  },
});

module.exports = mongoose.model("Event", eventSchema);
