const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const port = 3002;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: "vejnviurtwbuhb",
    resave: true,
    saveUninitialized: true,
  })
);

app.use((req, res, next) => {
  req.session.lastActivityTime = Date.now();
  next();
});

function authenticate(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    return res.redirect("/");
  }
}

function checkActivityAndLogout(req, res, next) {
  const currentTime = Date.now();
  const idleTime = currentTime - req.session.lastActivityTime;
  const idleTimeout = 30 * 60 * 1000;

  if (idleTime >= idleTimeout) {
    return res.redirect("/logout");
  } else {
    next();
  }
}

app.get("/", (req, res) => {
  return res.render("login");
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const response = await axios.get("http://localhost:3002/api/users");
    const users = response.data;
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
      req.session.user = user;
      return res.redirect(`/account/${user._id}`);
    } else {
      return res.render("login", { alert: "Пользователь не найден" });
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err.message);
      return res.status(500).send("Internal Server Error");
    }
    return res.redirect("/");
  });
});


app.get(
  "/account/:userId",
  authenticate,
  checkActivityAndLogout,
  async (req, res) => {
    const userId = req.params.userId;
    try {
      const response = await axios.get(
        `http://localhost:3002/api/users/${userId}`
      );
      const user = response.data;
      return res.render("account", { userId, user });
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      return res.status(500).send("Internal Server Error");
    }
  }
);

app.use((req, res) => {
  return res.status(404).render("404");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
