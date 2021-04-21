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
});

module.exports = mongoose.model("Event", eventSchema);
