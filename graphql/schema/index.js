// Build Schema function allows us to write our schema using a string
const { buildSchema } = require("graphql");

// note "input" is a type within graphql-for multiple arguments
// the "!" after ID means it cannot be nullable- the "!" after the array means is can be an empty array but not null
module.exports = buildSchema(`
type Booking {
  _id: ID!
  event: Event!
  user: User!
  createdAt: String!
  updatedAt: String!
}

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

type AuthData {
  userId: ID!
  token: String!
  tokenExpiration: Int!
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
  bookings: [Booking!]!
  login(email: String!, password: String!):AuthData!
}

type RootMutation {
  createEvent (eventInput:EventInput): Event
  createUser (userInput: UserInput): User
  bookEvent (eventId: ID!): Booking!
  cancelBooking (bookingId: ID!): Event!
}
schema {
  query: RootQuery
  mutation:RootMutation
}
`);
