# Verifications

This document records how to verify each layer of the application.

## Prerequisite verification

Verify the installed tools:

```bash
docker --version
node --version
npm --version
minikube version
kubectl version --client
k6 -v
```

## K8S verification

1. **Verify Minikube installation is complete**
   - Start Minikube with the Docker driver:

     ```bash
     minikube start --driver=docker
     ```

   - Verify that the Minikube container is running:

     ```bash
     docker ps | grep minikube
     ```

   - Verify that Minikube is running correctly:

     ```bash
     minikube status
     ```

   - Verify that Kubernetes is accessible and the node is ready:
     j
     `bash
kubectl get nodes
`

   - Expected result:

     ```text
     The Minikube container should be running, `minikube status` should show the cluster components as running, and `kubectl get nodes` should show the Minikube node with the `Ready` status.
     ```

### Verify Linear Prediction

In this section, we verify that the application is running normally.

- If you run k6 script, you should see the following logs. This is the expected result.

```
[Monitor Only] Current flow: 5691 B/s | TX: 4724 B/s | Predict: 4521.50 B/s | Recommended replicas: 1 | Scaling action is disabled.
[Monitor Only] Current flow: 8463 B/s | TX: 7639 B/s | Predict: 8251.87 B/s | Recommended replicas: 2 | Scaling action is disabled.
```

### Verify ingress

In this section, we verify that the ingress deployment is healthy.

- Check the ingress deployment status is `running`.

- Expected result:

```bash
kubectl get deployments -A | grep -i ingress
ingress-nginx   ingress-nginx-controller          1/1     1            1           45d
```

- Follow the steps below to check the Ingress metrics.
  1. Expose Ingress component port, and don't close the terminal.

  ```bash
  POD=$(kubectl -n ingress-nginx get pod -l app.kubernetes.io/component=controller -o name | head -n1)
  kubectl -n ingress-nginx port-forward "$POD" 10254:10254
  ```

  2. Open `127.0.0.1:10254/metrics` in your browser, and you will see all of your metrics logs.

### Verify update image in minikube

In this section, we assume that the Docker image has already been built and tagged as `visual-kube-app:1.0.0`.

- Update the Docker image into Minikube:
  1. `minikube image load visual-kube-app:1.0.0`
  2. `docker exec -it minikube bash`
  3. `docker image ls | grep visual-kube-app`
  4. `kubectl apply -f deployment/visual-kube-deployment.yaml`

- Check the Docker image of the pod:
  `kubectl describe pod $(kubectl get pods -l app=visual-kube-app -o jsonpath='{.items[0].metadata.name}')`
