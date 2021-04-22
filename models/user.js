const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdEvents:[
      {
          // Just storing the list of event ids created
          type: Schema.Types.ObjectId,
          // this allows a relation to be setup between 2 models- will help allow mongoose to automatically merge data
          ref: 'Event'
      }
  ]
});

module.exports = mongoose.model("User", userSchema);