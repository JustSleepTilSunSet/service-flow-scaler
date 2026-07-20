# Service flow scaler

This project predict network traffic for

# Prerequisite

- [minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Farm64%2Fstable%2Fbinary+download)

# Project Goal

- Enable adaptive scaling of the number of Pods.
- Provide a linear prediction approach to estimate the required number of Pods.

# Architecture

- See [arichecture](./docs/architecture.md)

# Tech/Environment Stack

This project is built with the following technologies and environment:

- **Node.js**: Used as the main application runtime.
- **Docker**: Used to containerize the application.
- **Minikube**: Used to run a local Kubernetes cluster for development and testing.
- **Kubernetes**: Used to deploy and manage application Pods.
- **Prometheus**: Used to collect metrics for monitoring and scaling decisions.
- **npm**: Used for Node.js dependency management.

# Repository Structure

```text
.
├── Dockerfile
├── docker-compose.yaml
├── docs
├── bin
├── ejsclient
│   ├── k8sclient.js
├── functions
│   ├── system.js
├── prometheus.yml
├── public
├── routes
├── services
├── views
└── model
```

## Quick start

- See [Development Setup](./docs/setup.md)

## Verification

- See [verification](./docs/verification.md)

## Troubleshooting

- See [Troubleshooting / FAQ](./docs/FAQ.md)
