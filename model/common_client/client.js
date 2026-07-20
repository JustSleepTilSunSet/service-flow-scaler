const http = require("node:http");
const https = require("node:https");

function request(method, urlString, options = {}) {
  const {
    headers = {},
    params = {},
    data = undefined,
    timeout = 10000,
  } = options;

  const url = new URL(urlString);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }

  const isHttps = url.protocol === "https:";
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    let body = null;
    const finalHeaders = { ...headers };

    if (data !== undefined) {
      body = typeof data === "string" ? data : JSON.stringify(data);

      if (!finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
      }

      finalHeaders["Content-Length"] = Buffer.byteLength(body);
    }

    const req = client.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method,
        headers: finalHeaders,
        timeout,
      },
      (res) => {
        let raw = "";

        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          let parsed = raw;
          const contentType = res.headers["content-type"] || "";

          if (contentType.includes("application/json")) {
            try {
              parsed = raw ? JSON.parse(raw) : null;
            } catch {
              parsed = raw;
            }
          }

          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Request timeout after ${timeout}ms`));
    });

    req.on("error", reject);

    if (body !== null) {
      req.write(body);
    }

    req.end();
  });
}

const api = {
  get(url, options = {}) {
    return request("GET", url, options);
  },
  post(url, data, options = {}) {
    return request("POST", url, { ...options, data });
  },
  put(url, data, options = {}) {
    return request("PUT", url, { ...options, data });
  },
  delete(url, options = {}) {
    return request("DELETE", url, options);
  },
};

module.exports = { request, api };
