var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const { buildOpenApiSpec } = require("./swagger");
const openapiSpec = buildOpenApiSpec();
var logger = require("morgan");
let { get_env } = require("./model/system/global_variable");
let global_variable = get_env();
var indexRouter = require("./routes/index");

let { initK8s } = require("./service/ScaleService");
let { startTrafficMonitoring } = require("./model/monitor/monitor");

require("dotenv").config();
var app = express();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

(async () => {
  await initK8s();

  startTrafficMonitoring();
  console.log("✅ app turn on.");
})();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  "/",
  (req, res, next) => {
    global_variable = get_env();
    next();
  },
  indexRouter,
);

app.get("/openapi.json", (req, res) => {
  res.json(openapiSpec);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});
console.log(global_variable.MODE);
module.exports = app;
