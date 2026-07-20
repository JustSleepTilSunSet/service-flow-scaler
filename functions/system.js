const os = require("os");
const memoryHog = [];
function getCPUUsage() {
  const cpus = os.cpus();
  let user = 0,
    nice = 0,
    sys = 0,
    idle = 0,
    irq = 0;
  for (let cpu of cpus) {
    user += cpu.times.user;
    nice += cpu.times.nice;
    sys += cpu.times.sys;
    idle += cpu.times.idle;
    irq += cpu.times.irq;
  }
  const total = user + nice + sys + idle + irq;
  return { idle, total };
}
function burnCPU(n) {
  let x = 0 >>> 0;
  for (let i = 0; i < n; i++) x = (x * 1664525 + 1013904223) >>> 0;
  return x;
}

function burnMemory(memMb) {
  if (!Number.isFinite(memMb) || memMb <= 0) return 0;

  const chunkSize = 1024 * 1024; // 1 MB
  const chunksCount = Math.floor(memMb); // MB
  const chunks = [];

  for (let i = 0; i < chunksCount; i++) {
    const buf = Buffer.alloc(chunkSize, 1);
    chunks.push(buf);
  }

  memoryHog.push(chunks);
  return chunksCount;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
exports.getCPUUsage = getCPUUsage;
exports.burnCPU = burnCPU;
exports.burnMemory = burnMemory;
