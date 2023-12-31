const express = require('express');
const path = require('path');
const db = require('./config/connection');
const { ApolloServer }  = require("@apollo/server");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require('./utils/auth');
const { expressMiddleware } = require('@apollo/server/express4')

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname , '../client/dist')));
}

app.get('*' , (req ,res) => {
  res.sendFile(path.join(__dirname , '../client/dist/index.html'))
})

const startApolloServer = async () => {
  await server.start();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use('/graphql' , expressMiddleware(server));
  db.once('open' , () => {
    app.listen(PORT , () => {
      console.log(`API server running on port ${PORT}!`);
    })
  })
};

startApolloServer();
