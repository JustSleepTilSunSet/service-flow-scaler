let express = require("express");
let router = express.Router();
let {
  listPodMetrics,
  listPodsForDeployment,
} = require("../../service/ScaleService");
/**
 * @openapi
 * /v1/listdeployment:
 *   get:
 *     summary: Get running pod name in namespace.
 *     responses:
 *       200:
 *         description: Return current running pod name.
 */
router.get("/listdeployment", async (req, res) => {
  deploymentList = await listPodsForDeployment();
  return res.status(200).json({
    message: "OK",
    success: true,
    data: deploymentList.map((x) => x.metadata.name),
  });
});

/**
 * @openapi
 * /v1/scale:
 *   post:
 *     summary: Scale pod in k8s.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - replicas
 *             properties:
 *               replicas:
 *                 type: number
 *                 example: 3
 *     responses:
 *       200:
 *         description: Scale result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OK
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid replicas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Random fail
 *                 success:
 *                   type: boolean
 *                   example: false
 */
router.post("/scale", async (req, res) => {
  let { replicas } = req.body;
  if (replicas === null || typeof replicas !== "number") {
    return res.status(400).json({ message: "Random fail", success: false });
  }
  return res
    .status(200)
    .json({ message: "OK", success: await scale(replicas) });
});

/**
 * @openapi
 * /v1/listPodMetrics:
 *   get:
 *     summary: list pod metrics
 *     responses:
 *       200:
 *         description: Return list pod metrics.
 */
router.get("/listPodMetrics", async (req, res) => {
  return res
    .status(200)
    .json({ message: "OK", success: true, data: await listPodMetrics() });
});

module.exports = router;
