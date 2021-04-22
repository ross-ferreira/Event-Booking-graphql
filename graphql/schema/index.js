// Build Schema function allows us to write our schema using a string
const { buildSchema } = require("graphql");

// note "input" is a type within graphql-for multiple arguments
// the "!" after ID means it cannot be nullable- the "!" after the array means is can be an empty array but not null
module.exports = buildSchema(`
type Event {
  _id: ID!
  title: String!
  description: String!
  price: Float!
  date: String!
  creator: User!
}

type User {
  _id: ID!
  email: String!
  password: String
  createdEvents: [Event!]
}

input EventInput {
  title: String!
  description: String!
  price: Float!
  date: String!
}

input UserInput {
  email: String!
  password: String!
}

type RootQuery {
    events: [Event!]!
}

type RootMutation {
    createEvent (eventInput:EventInput): Event
    createUser (userInput: UserInput): User
}
    schema {
        query: RootQuery
        mutation:RootMutation
    }
`);
