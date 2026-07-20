var express = require("express");
var router = express.Router();
const {
  sleep,
  getCPUUsage,
  burnCPU,
  burnMemory,
} = require("../../functions/system");
/**
 * @openapi
 * /v1/stress/running:
 *   get:
 *     summary: Run stress workload for sleep, CPU, and memory allocation.
 *     description: |
 *       Simulates workload by optionally sleeping for a period, burning CPU loops,
 *       and allocating memory. All inputs are passed as query parameters.
 *     tags:
 *       - Stress
 *     parameters:
 *       - in: query
 *         name: work_ms
 *         required: false
 *         description: Sleep duration in milliseconds.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 500
 *       - in: query
 *         name: cpu_loops
 *         required: false
 *         description: Number of CPU burn loops.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 10000000
 *       - in: query
 *         name: mem_mb
 *         required: false
 *         description: Approximate memory to allocate in MB.
 *         schema:
 *           type: integer
 *           minimum: 0
 *           example: 128
 *     responses:
 *       200:
 *         description: Stress execution result.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - ok
 *                 - work_ms
 *                 - cpu_loops
 *                 - mem_mb
 *                 - allocatedMb
 *                 - result
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 work_ms:
 *                   type: integer
 *                   example: 500
 *                 cpu_loops:
 *                   type: integer
 *                   example: 10000000
 *                 mem_mb:
 *                   type: integer
 *                   example: 128
 *                 allocatedMb:
 *                   type: integer
 *                   example: 128
 *                 result:
 *                   type: object
 *                   description: CPU execution result. May be empty if cpu_loops is 0.
 *                   properties:
 *                     cpuUsage:
 *                       type: string
 *                       example: "73.21%"
 *                     duration:
 *                       type: string
 *                       example: "245ms"
 */
router.get("/stress/running", async (req, res) => {
  const work_ms = Number.parseInt(req.query.work_ms ?? "0", 10);
  const cpu_loops = Number.parseInt(req.query.cpu_loops ?? "0", 10);
  const mem_mb = Number.parseInt(req.query.mem_mb ?? "0", 10);
  let result = {};
  if (Number.isFinite(work_ms) && work_ms > 0) {
    await sleep(work_ms);
    console.log(`work_ms: ${work_ms}`);
  }
  if (Number.isFinite(cpu_loops) && cpu_loops > 0) {
    const start = getCPUUsage();
    const startTime = Date.now();
    burnCPU(cpu_loops);
    console.log(`cpu_loops=${cpu_loops}`);
    const end = getCPUUsage();
    const endTime = Date.now();

    const idleDiff = end.idle - start.idle;
    const totalDiff = end.total - start.total;
    const usage = 100 - (100 * idleDiff) / totalDiff;

    result = {
      cpuUsage: `${usage.toFixed(2)}%`,
      duration: `${endTime - startTime}ms`,
    };
  }

  let allocatedMb = 0;
  if (Number.isFinite(mem_mb) && mem_mb > 0) {
    allocatedMb = burnMemory(mem_mb);
    console.log(`mem_mb≈${allocatedMb}`);
  }

  return res
    .status(200)
    .json({ ok: true, work_ms, cpu_loops, mem_mb, allocatedMb, result });
});

// Test the API fail response in ingress.
router.get("/random", (req, res) => {
  const success = Math.random() < 0.5;
  if (success) {
    res.status(200).json({ message: "OK", success: true });
  } else {
    res.status(500).json({ message: "Random fail", success: false });
  }
});

module.exports = router;
