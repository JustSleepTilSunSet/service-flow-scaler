const swaggerJSDoc = require("swagger-jsdoc");

function buildOpenApiSpec() {
  return swaggerJSDoc({
    failOnErrors: true,
    definition: {
      openapi: "3.0.3",
      info: {
        title: "My API",
        version: "1.0.0",
      },
    },
    apis: ["./routes/**/*.js", "./app.js"],
  });
}

module.exports = { buildOpenApiSpec };
