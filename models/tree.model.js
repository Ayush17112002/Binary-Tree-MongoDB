const mongoose = require("mongoose");

const schema = mongoose.Schema({
  node: { type: Number, unique: true },
  nbrs: [{ type: Number }],
});

const treeModel = mongoose.model("undirectedBinaryTree", schema);

module.exports = treeModel;
