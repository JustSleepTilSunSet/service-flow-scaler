var express = require("express");
var router = express.Router();
let kubectl_router = require("./kubecontroller/router");
let stress_router = require("./stresscontroller/router");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: `Testing page.` });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Return current version
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "version: 1.0.0"
 */
router.get("/health", function (req, res) {
  res.send(`version: ${process.env.VERSION}`);
});

router.use("/v1", kubectl_router);
router.use("/v1", stress_router);
module.exports = router;
