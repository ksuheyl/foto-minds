// initialServerFile.js
const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const route = require("./routes/index.js");
const PORT = 8080;
const app = express();
const dotenv = require("dotenv");
const db = require("./models");

app.use(cors());
app.use(bodyParser.json());

dotenv.config({
  path: "./config/.env",
});

// Statik dosya servisi
app.use("/uploads", express.static("uploads"));

app.use("/api", route);

app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:5173/", // Orjinal URL
    changeOrigin: true,
    onProxyRes: function (proxyRes, req, res) {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
    },
  })
);

app.listen(PORT, async () => {
  // await db.sync();
  // db.sequelize.sync();
  console.log(`Server running on http://localhost:${PORT}`);
});
