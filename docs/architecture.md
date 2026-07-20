# Architecture

This project uses a Node.js-based scheduler service to adaptively adjust the number of Kubernetes Pods.

The scheduler periodically monitors Pod network traffic, applies a linear prediction algorithm, and updates the required Pod count in the Kubernetes environment.

## Component Roles

```text
[Node.js Scheduler Service]
├── Run scheduled monitoring logic.
├── Execute `monitor_k8s.sh` to collect Pod network traffic.
├── Apply linear prediction to estimate the required Pod count.
└── Adjust Kubernetes Pod replicas based on the prediction result.

[Kubernetes / Minikube]
├── Run Ingress.
└── Run Application Pods.

[K6 Load Test Script]
└── Generate traffic to simulate workload against the application.
```

## Workflow Overview

```text
[K6 Load Test Script]
        |
        | Generate traffic
        v
[Ingress]
        |
        v
[Application Pods]
        ^
        |
        | Monitor Pod network traffic by schedule
        |
[Node.js Scheduler Service]
        |
        | Predict required Pod count
        |
        v
[Kubernetes / Minikube]
        |
        | Update Pod replicas
        v
[Application Pods]
```
