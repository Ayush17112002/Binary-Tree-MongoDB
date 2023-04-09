const treeModel = require("../models/tree.model");

const addNodes = async (req, res) => {
  try {
    const { nodes } = req.body;
    if (!nodes || nodes === undefined || !nodes.length) {
      throw new Error("Nodes not found!");
    }
    for (let i = 0; i < nodes.length; i++) {
      await treeModel.create({ node: nodes[i] });
    }
    const tree = await treeModel.find({});
    return res.status(200).json({ tree: tree });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};

const addEdges = async (req, res) => {
  const done = [];
  try {
    const { edges } = req.body;
    if (!edges || edges === undefined || !edges.length) {
      throw new Error("Edges not found!");
    }
    for (let i = 0; i < edges.length; i++) {
      const u = edges[i][0],
        v = edges[i][1];
      const doc = await treeModel.find({ $or: [{ node: u }, { node: v }] });
      if (
        doc.length < 2 ||
        doc[0].nbrs.length == 2 ||
        doc[1].nbrs.length == 2
      ) {
        throw new Error(
          "Either nodes have 2 children or nodes are not present"
        );
      }
      let present = false;
      for (const val of doc[0].nbrs) {
        if (val == v) {
          present = true;
        }
      }
      if (present) continue;
      done.push([u, v]);
      await treeModel.findOneAndUpdate({ node: u }, { $addToSet: { nbrs: v } });
      await treeModel.findOneAndUpdate({ node: v }, { $addToSet: { nbrs: u } });
    }
    const tree = await treeModel.find({});
    return res.status(200).json({ tree: tree });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
      edgesAdded: done,
    });
  }
};

const bfs = async (req, res) => {
  try {
    const root = Number(req.params["root"]);
    let queue = [];
    queue.push(root);
    let bfsTraversal = {};
    let vis = new Set();
    let lvl = 0;
    vis.add(root);
    while (queue.length > 0) {
      let curr = [];
      let sz = queue.length;
      while (sz--) {
        const val = queue.shift();
        curr.push(val);
        const node = await treeModel.findOne({ node: val });
        for (let i = 0; i < node.nbrs.length; i++) {
          if (!vis.has(node.nbrs[i])) {
            queue.push(node.nbrs[i]);
            vis.add(node.nbrs[i]);
          }
        }
      }
      bfsTraversal[lvl++] = curr;
    }
    return res.status(200).json({ bfs: bfsTraversal });
  } catch (err) {
    return res.status(400).json({
      error: err,
    });
  }
};

const removeEdges = async (req, res) => {
  try {
    const { edges } = req.body;
    if (!edges || edges === undefined || !edges.length) {
      throw new Error("Edges not found!");
    }
    for (let i = 0; i < edges.length; i++) {
      const u = edges[i][0],
        v = edges[i][1];
      await treeModel.findOneAndUpdate({ node: u }, { $pull: { nbrs: v } });
      await treeModel.findOneAndUpdate({ node: v }, { $pull: { nbrs: u } });
    }
    return res.status(200).json({
      message: "success",
    });
  } catch (err) {
    return res.status(400).json({
      error: err.message,
    });
  }
};
module.exports = { addNodes, addEdges, bfs, removeEdges };
