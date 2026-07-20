/** @typedef {import('@kubernetes/client-node').CoreV1ApiListNamespacedPodRequest} CoreAPIRequestCfg*/
let {
  getAppsClient,
  namespace,
  deployment,
  getCoreClient,
  getCustomClient,
} = require("../ejs_client/k8sclient");
/** @type {import('@kubernetes/client-node').AppsV1Api | null} */
let apps = null;
/** @type {import('@kubernetes/client-node').CoreV1Api | null} */
let core = null;
/** @type {import('@kubernetes/client-node').CustomObjectsApi | null} */
let custom = null;
/** @type {boolean} */
let isK8sReady = false;

async function initK8s() {
  try {
    console.log("--- Initializing K8s client ---");
    apps = await getAppsClient();
    core = await getCoreClient();
    custom = await getCustomClient();

    isK8sReady = true;
    console.log("✅ K8S client work on.");
  } catch (err) {
    console.error("❌ Initialize K8S occured exception", err);
    process.exit(1); // 初始化失敗就結束程式
  }
}

/**
 *
 * @param {string} cpu
 * @returns number
 */
function cpuToMilli(cpu) {
  if (cpu.endsWith("n")) return Number(cpu.slice(0, -1)) / 1e6; // nanocores -> millicores
  if (cpu.endsWith("u")) return Number(cpu.slice(0, -1)) / 1e3; // micro -> milli
  if (cpu.endsWith("m")) return Number(cpu.slice(0, -1)); // millicores
  return Number(cpu) * 1000; // cores -> millicores
}

/**
 *
 * @param {string} mem
 * @returns number
 */
function memToMi(mem) {
  const m = mem.match(/^([0-9.]+)(Ki|Mi|Gi)?$/);
  if (!m) return NaN;
  const v = Number(m[1]);
  const u = m[2] || "";
  if (u === "Ki") return v / 1024;
  if (u === "Mi") return v;
  if (u === "Gi") return v * 1024;
  return v / (1024 * 1024); // fallback（很少用到）
}

/** @type {CoreAPIRequestCfg} */
const req = {
  namespace: namespace,
  labelSelector: `app=${deployment}`,
};

async function listPodMetrics() {
  const res = await custom.listNamespacedCustomObject({
    group: "metrics.k8s.io",
    version: "v1beta1",
    namespace: namespace,
    plural: "pods",
    labelSelector: `app=${deployment}`,
  });

  // console.log("RAW:", JSON.stringify(res, null, 2));
  usage_table = {};
  for (item of res.items) {
    meta_name = item?.metadata?.name;
    for (container of item?.containers) {
      usage = container.usage;
      usage_table[meta_name] = {
        cpu: cpuToMilli(usage["cpu"]),
        memory: memToMi(usage["memory"]),
      };
    }
  }
  console.log(usage_table);
  return usage_table;
}

/**
 * Do pod scale.
 * @param {number} replicas
 * @returns {Promise<void>}
 */
exports.scale = async function scale(replicas) {
  const before = await apps.readNamespacedDeploymentScale(
    {
      name: deployment,
      namespace: namespace,
      body: { spec: { replicas: replicas } },
    },
    { headers: { "Content-Type": "application/merge-patch+json" } },
  );
  // console.log('deployment =', deployment, 'namespace =', namespace);
  // console.log('before:', before);

  // 2) Check pod metrics
  let pods_metrics = await listPodMetrics();
  // console.log(`pods_metrics: ${JSON.stringify(pods_metrics, null, 2)}`)
  let all_pods = Object.keys(pods_metrics).length;
  let all_cpu = 0.0;
  for (let pod_meta_name of Object.keys(pods_metrics)) {
    cpu = pods_metrics[pod_meta_name].cpu;
    all_cpu = all_cpu + cpu;
  }
  // console.log(all_cpu / all_pods)

  // 3) patch scale.
  should_to_scale = all_cpu / all_pods > 0.02;
  should_to_scale = true;
  if (should_to_scale) {
    const patch = [{ op: "replace", path: "/spec/replicas", value: replicas }];

    await apps.patchNamespacedDeploymentScale(
      {
        name: deployment,
        namespace,
        body: patch,
      },
      {
        headers: { "Content-Type": "application/json-patch+json" },
      },
    );

    const after = await apps.readNamespacedDeploymentScale({
      name: deployment,
      namespace,
    });
    console.log("after replicas:", after.spec?.replicas);
    return true;
  } else {
    console.log("No need scale.");
    return false;
  }
};

exports.listPodsForDeployment = async function listPodsForDeployment() {
  try {
    if (core == null) {
      return [];
    }

    const res = await core.listNamespacedPod(req);
    return res?.items ?? [];
  } catch (_) {
    return [];
  }
};
exports.listPodMetrics = listPodMetrics;
exports.initK8s = initK8s;
