const express = require("express");
const bodyParser = require("body-parser");
// Middleware for graphql queries that are incoming
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const graphQlSchema = require("./graphql/schema/index");
const graphQlResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  //CORS - Wild card allows requests from every location
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next()
});

app.use(isAuth);

app.use(
  "/graphql",
  graphqlHTTP({
    // this should point to a valid graphql schema
    schema: graphQlSchema,
    // this will point to an object that has all the resolver functions in it
    rootValue: graphQlResolvers,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ti6an.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(9000);
  })
  .catch((err) => console.log(err));

// 1) Query- Means fetch data in Graphql - Part of "graphql keywords"
// 2) Mutation- means create/change data - Part of "graphql keywords"
