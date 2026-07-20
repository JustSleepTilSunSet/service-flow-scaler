const WINDOW_SIZE = 12; // Keep the most recent 12 samples (~1 minute if the script outputs one line every 5 seconds).
const RX_HISTORY = [];
const THRESHOLD_BPS = 5000; // Per-pod capacity (B/s): scale out if predicted RX exceeds 5,000 B/s per pod.
const { spawn } = require("child_process");
let { getLinearPrediction } = require("../prediction/prediction");
let { scale, listPodsForDeployment } = require("../../service/ScaleService");
exports.startTrafficMonitoring = async function startTrafficMonitoring() {
  try {
    console.log("✅ pod monitor is waiting.");
    console.warn(
      "⚠️ Current limitation: traffic monitoring is log-only. Auto scaling and remediation are not enabled.",
    );

    deploymentList = await listPodsForDeployment();
    let ns = process.env.NAMESPACE;
    let pod = deploymentList?.[0]?.metadata?.name;

    if (!pod) {
      console.warn("⚠️ No pod detected. Monitoring is unavailable.");
      return;
    }

    const monitor = spawn("sh", ["monitor_k8s.sh", ns, pod], {
      cwd: __dirname,
    });

    console.log(`Default namespace '${ns}',and detect pod '${pod}'`);

    monitor.stdout.on("data", async (data) => {
      const output = data.toString().trim();
      const lines = output.split("\n");

      for (const line of lines) {
        if (line.includes(",")) {
          const [rxRate, txRate] = line.split(",").map(Number);

          RX_HISTORY.push(rxRate);
          if (RX_HISTORY.length > WINDOW_SIZE) RX_HISTORY.shift();

          if (RX_HISTORY.length >= 5) {
            const predicted_rx = getLinearPrediction(RX_HISTORY);
            const safe_predicted_rx = Math.max(0, predicted_rx);
            const target_replicas =
              Math.ceil(safe_predicted_rx / THRESHOLD_BPS) || 1;

            console.log(
              `[Monitor Only] Current flow: ${rxRate} B/s | TX: ${txRate} B/s | Predict: ${safe_predicted_rx.toFixed(2)} B/s | Recommended replicas: ${target_replicas} | Scaling action is disabled.`,
            );
          } else {
            console.log(
              `[Monitor Only] Current flow: ${rxRate} B/s | TX: ${txRate} B/s | Waiting for enough samples.`,
            );
          }
        } else {
          console.log(`❌ [System error log]: ${line}`);
        }
      }
    });

    monitor.stderr.on("data", (data) => {
      console.error(`Shell Error: ${data}`);
    });
  } catch (error) {
    console.warn(
      `⚠️ Monitoring is currently limited to logging only: ${error?.message ?? error}`,
    );
    return {};
  }
};
