const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const secretText = "superSecret";

const posts = [
  {
    username: "경",
    title: "Post 1",
  },
  {
    username: "원",
    title: "Post 2",
  },
];

app.use(express.json());

const port = 4000;

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  // jwt를 이용해서 토큰 생성하기 payload + secretText
  const accessToken = jwt.sign(user, secretText);
  res.json({ accessToken: accessToken });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

app.listen(port, () => {
  console.log("listening on port" + port);
});
