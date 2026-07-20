// @ts-check
/** @typedef {import('@kubernetes/client-node')} K8s */
/** @typedef {import('@kubernetes/client-node').KubeConfig} KubeConfig */
/** @typedef {import('@kubernetes/client-node').AppsV1Api} AppsV1Api */
/** @typedef {import('@kubernetes/client-node').CoreV1Api} CoreV1Api */
/** @typedef {import('@kubernetes/client-node').CustomObjectsApi} CustomObjectsApi */
require('dotenv').config()

const namespace = process.env.NAMESPACE || "default";
const deployment = process.env.DEPLOYMENT || "my-app-name";

/** @type {AppsV1Api | null} */
let appsClient = null;

/** @type {CoreV1Api | null} */
let coreClient = null;

/** @type {K8s| null} */
let k8s = null

/** @type {CustomObjectsApi| null} */
let customClient = null

/** @type {KubeConfig| null} */
let kc = null

/** @returns null */
const initK8s = async () => {
    // Use k8s.KubeConfig and other utilities here
    k8s = await import('@kubernetes/client-node');
    kc = new k8s.KubeConfig();

    // Load from cluster or Default.    
    process.env.KUBERNETES_SERVICE_HOST
        ? kc.loadFromCluster()
        : kc.loadFromDefault();
    // kc.loadFromDefault()
    // Show all clusters.
    for (const c of kc.getClusters()) {
        // @ts-ignore
        // Need to skip the cluster TLS verified.
        c.skipTLSVerify = true
        console.log(" -", c.name, c.server, "skipTLSVerify=", c.skipTLSVerify);
    }

};

/** @returns {Promise<import('@kubernetes/client-node').AppsV1Api>} */
exports.getAppsClient = async function getAppsClient() {
    await initK8s();
    if (k8s == null) {
        throw Error("k8s import error.")
    }
    if (kc == null) {
        throw Error("set kube config error.")
    }
    
    if (!appsClient) {
        appsClient = kc.makeApiClient(k8s.AppsV1Api);
    }
    return appsClient;
}
exports.getCoreClient = async function getCoreClient() {

    await initK8s();
    if (k8s == null) {
        throw Error("k8s import error.")
    }
    if (kc == null) {
        throw Error("set kube config error.")
    }
    
    if (!coreClient) {
        await initK8s();
        coreClient = kc.makeApiClient(k8s.CoreV1Api)
    }
    return coreClient;
}
exports.getCustomClient = async function getCustomClient() {

    await initK8s();
    if (k8s == null) {
        throw Error("k8s import error.")
    }
    if (kc == null) {
        throw Error("set kube config error.")
    }
    
    if (!customClient) {
        await initK8s();
        customClient = kc.makeApiClient(k8s.CustomObjectsApi)
    }
    return customClient;
}
exports.namespace = namespace
exports.deployment = deployment