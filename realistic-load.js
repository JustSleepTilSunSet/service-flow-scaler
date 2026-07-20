import http from "k6/http";
import { check } from "k6";
import { CONFIG } from "./k6_config.js";

const BASE_URL = CONFIG.BASE_URL.replace(/\/+$/, "");
const AUTH_TOKEN = CONFIG.AUTH_TOKEN ?? "";

const RATE = CONFIG.RATE;
const DURATION = CONFIG.DURATION;
const PRE_VUS = CONFIG.PRE_VUS;
const MAX_VUS = CONFIG.MAX_VUS;

const WORK_MS = CONFIG.WORK_MS ?? 200;
const CPU_LOOPS = CONFIG.CPU_LOOPS ?? 0;
const MEM_MB = CONFIG.MEM_MB ?? 0;

function encodeQuery(params) {
  return Object.entries(params)
    .map(([key, value]) => {
      return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
    .join("&");
}

export const options = {
  scenarios: {
    stress_api: {
      executor: "constant-arrival-rate",
      rate: RATE,
      timeUnit: "1s",
      duration: DURATION,
      preAllocatedVUs: PRE_VUS,
      maxVUs: MAX_VUS,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const query = encodeQuery({
    work_ms: WORK_MS,
    cpu_loops: CPU_LOOPS,
    mem_mb: MEM_MB,
  });

  const headers = {
    Accept: "application/json",
  };

  if (AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  const res = http.get(`${BASE_URL}/v1/stress/running?${query}`, { headers });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "ok is true": (r) => {
      try {
        const body = r.json();
        return body && body.ok === true;
      } catch (e) {
        return false;
      }
    },
  });
}
