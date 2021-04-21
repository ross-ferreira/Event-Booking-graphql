const express = require("express");
const bodyParser = require("body-parser");
// Middleware for graphql queries that are incoming
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
// Build Schema function allows us to write our schema using a string
const mongoose = require("mongoose");

const Event = require("./models/event");

const app = express();

app.use(bodyParser.json());

app.use(
  "/graphql",
  graphqlHTTP({
    // note "input" is a type within graphql-for multiple arguments
    // the "!" after ID means it cannot be nullable- the "!" after the array means is can be an empty array but not null
    // this should point to a valid graphql schema
    schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
        events: [Event!]!
    }

    type RootMutation {
        createEvent(eventInput:EventInput): Event
    }
        schema {
            query: RootQuery
            mutation:RootMutation
        }
    `),
    // this will point to an object that has all the resolver functions in it
    rootValue: {
      // events here is linked to events schema
      events: () => {
        return Event.find()
          .then((events) => {
            // mapping over events to extract out the data needed as mongo will respond with metadata within the request
            return events.map((event) => {
              return {
                ...event._doc,
                // need to convert id to a string from db
                _id: event._doc._id.toString(),
              };
            });
          })
          .catch((err) => console.log(err));
      },
      createEvent: (args) => {
        // this Event is from the models schema
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        // this "save" function is provided by mongoose - it will write the data into the mongodb db
        return event
          .save()
          .then((result) => {
            console.log(result);
            return {
              ...result._doc,
              // event.id will use mongoose to convert it automatimcally
              _id: event.id,
            };
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
        return event;
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ti6an.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));

// 1) Query- Means fetch data in Graphql - Part of "graphql keywords"
// 2) Mutation- means create/change data - Part of "graphql keywords"
