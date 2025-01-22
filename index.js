const express = require("express");
const app = express();
const port = 2001;
const users = require("./routes/userRoutes");
const lists = require("./routes/listRoutes");
const tasks = require("./routes/taskRoutes");
app.use(express.json());
// user sign in/up.
app.use("/auth", users);
//user account edit.
app.use("/user", users);

app.use("/list", lists);

app.use("/task", tasks);

app.listen(port, () => {
   console.log(`listening on port ${port}`);
});
