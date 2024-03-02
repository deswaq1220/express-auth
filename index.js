const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const secretText = "superSecret";
const refreshSecretText = "superSuperSecret";

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

let refreshTokens = [];

const port = 4000;

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("ㅎㅇ");
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };

  // jwt를 이용해서 토큰 생성하기 payload + secretText
  //유효기간 추가
  const accessToken = jwt.sign(user, secretText, { expiresIn: "30s" });

  //jwt를 이용한 리프레시 토큰 생성

  const refreshToken = jwt.sign(user, refreshSecretText, { expiresIn: "1d" });
  refreshTokens.push(refreshToken);
  //refresh토큰을 쿠키에 넣기
  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken: accessToken });
});

app.get("/posts", authMiddleware, (req, res) => {
  res.json(posts);
});

function authMiddleware(req, res, next) {
  // 토큰을 request headers에서 가져오기
  const authHeader = req.header["authorization"];
  // Bearer dfdfdgdg.fdgfdgd.gfdgfdg
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(400);
  // 토큰이 있으니 유효한 토큰인지 확인
  jwt.verify(token, secretText, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get("/refresh", (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;
  //리프레시 토큰이 데이터베이스에 있는 토큰인지 확인
  if (!refreshToken.includes(refreshToken)) {
    return res.sendStatus(403);
  }
  //token이 유효한 토큰인지 확인
  jwt.verify(refreshToken, refreshSecretText, (err, user) => {
    if (err) return res.sendStatus(403);
    //엑세스 토큰 생성
    const accessToken = jwt.sign({ name: user.name }, secretText, {
      expiresIn: "30s",
    });
    res.json({ accessToken });
  });
});

app.listen(port, () => {
  console.log("listening on port" + port);
});
