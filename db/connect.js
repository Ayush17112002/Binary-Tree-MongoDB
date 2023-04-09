const mongoose = require("mongoose");

const connect = async () => {
  const conn = await mongoose.connect(process.env.DB_URL);
  return conn;
};

connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Error in connecting to database");
  });
