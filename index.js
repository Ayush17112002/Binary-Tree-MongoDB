const express = require("express");
const app = express();
const dotenv = require("dotenv");
const treeController = require("./controllers/tree.controller");
dotenv.config();
const PORT = process.env.PORT;
app.use(express.json());
require("./db/connect");
const treeModel = require("./models/tree.model");
app.put("/addNodes", treeController.addNodes);
app.put("/addEdges", treeController.addEdges);
app.get("/bfs/:root", treeController.bfs);
app.listen(PORT, (err) => {
  if (err) {
    console.error("Error in running the server!");
  } else {
    console.log("Server is running at the port ", PORT);
  }
});
