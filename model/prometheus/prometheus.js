const { api } = require("../common_client/client");

const PROM_BASE_URL = process.env.PROM_BASE_URL || "http://localhost:9090";
const PROM_BEARER_TOKEN = process.env.PROM_BEARER_TOKEN || "";

function buildHeaders() {
  const headers = {
    Accept: "application/json",
  };

  if (PROM_BEARER_TOKEN) {
    headers.Authorization = `Bearer ${PROM_BEARER_TOKEN}`;
  }

  return headers;
}

async function instantQuery(query, timeout = 5000) {
  const res = await api.get(`${PROM_BASE_URL}/api/v1/query`, {
    params: { query },
    headers: buildHeaders(),
    timeout,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Prometheus HTTP ${res.status}`);
  }

  if (!res.data || res.data.status !== "success") {
    throw new Error(res.data?.error || "Prometheus instant query failed");
  }

  return res.data.data;
}

async function rangeQuery(query, start, end, step, timeout = 5000) {
  const res = await api.get(`${PROM_BASE_URL}/api/v1/query_range`, {
    params: { query, start, end, step },
    headers: buildHeaders(),
    timeout,
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Prometheus HTTP ${res.status}`);
  }

  if (!res.data || res.data.status !== "success") {
    throw new Error(res.data?.error || "Prometheus range query failed");
  }

  return res.data.data;
}

function getVectorValue(data) {
  const result = data?.result;

  if (!Array.isArray(result) || result.length === 0) {
    return 0;
  }

  const first = result[0];

  if (Array.isArray(first?.value) && first.value.length >= 2) {
    return Number(first.value[1]);
  }

  return 0;
}

async function readCurrentRps(query) {
  const data = await instantQuery(query);
  return getVectorValue(data);
}

async function readRpsSeries(
  query,
  minutes = 10,
  step = "30s",
  timeout = 5000,
) {
  const end = Math.floor(Date.now() / 1000);
  const start = end - minutes * 60;

  const data = await rangeQuery(query, start, end, step, timeout);
  const result = data?.result;

  if (!Array.isArray(result) || result.length === 0) {
    return [];
  }

  return result.flatMap((series) => {
    const values = Array.isArray(series?.values) ? series.values : [];

    return values.map(([ts, value]) => ({
      ts: Number(ts),
      rps: Number(value),
      metric: series.metric || {},
    }));
  });
}
module.exports = {
  instantQuery,
  rangeQuery,
  readRpsSeries,
  getVectorValue,
  readCurrentRps,
};
