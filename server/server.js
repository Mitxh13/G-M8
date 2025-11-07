const express = require("express");
const { errorHandler } = require("./middleware/errorMiddleware");
const dotenv = require("dotenv").config();
const connectDB = require("./config/db");
const port = process.env.PORT || 5050;

//mitesh edits:- 
const http = require("http");                    
const cors = require("cors");                    
const initSocket = require("./config/socket");  
connectDB();

const app = express();

app.use(cors()); //adding from mitesh

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/users", require("./routes/userRoutes"));

//addons from mitesh
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));


app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
