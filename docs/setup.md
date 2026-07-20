# Setup

This document describes how to build the application image, deploy the application to Kubernetes, expose the application through Service and Ingress, run the client prediction service, and execute the k6 load test.

This document provides a Minikube-based setup scenario.

## Prerequisites

- Docker
- Node.js
- npm
- kubectl
- minikube
- k6

## 1. Start Minikube

Start the Minikube cluster:

```bash
minikube start --driver=docker
```

Enable the NGINX Ingress Controller:

```bash
minikube addons enable ingress
```

If your environment requires a tunnel for local access, open another terminal and run:

```bash
minikube tunnel
```

> Note: Keep the `minikube tunnel` terminal running while testing local access.

### Verification

Check the Minikube status:

```bash
minikube status
```

Expected result:

```bash
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

Check the Kubernetes node:

```bash
kubectl get nodes
```

Expected result:

```bash
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane    1m    <version>
```

Check the Ingress Controller status:

```bash
kubectl get pods -n ingress-nginx
```

Expected result:

```bash
NAME                                        READY   STATUS      RESTARTS   AGE
ingress-nginx-controller-xxxxxxxxxx-xxxxx   1/1     Running     0          1m
```

## 2. Build the Application Image

Build the Docker image from the project root:

```bash
docker build -t <your-image>:<new-tag> .
```

> Note: Make sure the `Dockerfile` exists in the current directory.
> If the `Dockerfile` is in another path, specify it with `-f`.

Example:

```bash
docker build -t visual-kube-app:v1 .
```

### Verification

Check that the image was created successfully:

```bash
docker images | grep <your-image>
```

Expected result:

```bash
<your-image>   <new-tag>   <image-id>   <created-time>   <size>
```

## 3. Deploy the Application Deployment

Apply the Kubernetes Deployment manifest:

```bash
kubectl apply -f visual-kube-deployment.yaml
```

> Note: Make sure `visual-kube-deployment.yaml` exists in the current directory.

### Verification

Check the Deployment status:

```bash
kubectl get deployments
```

Expected result:

```bash
NAME                READY   UP-TO-DATE   AVAILABLE   AGE
<deployment-name>   1/1     1            1           10s
```

Check the Pod status:

```bash
kubectl get pods
```

Expected result:

```bash
NAME                                READY   STATUS    RESTARTS   AGE
<deployment-name>-xxxxxxxxx-xxxxx   1/1     Running   0          10s
```

Verify the rollout status:

```bash
kubectl rollout status deployment/<deployment-name>
```

Expected result:

```bash
deployment "<deployment-name>" successfully rolled out
```

## 4. Deploy the Application Service

Apply the Kubernetes Service manifest:

```bash
kubectl apply -f visual-kube-service.yaml
```

> Note: The Service name should match the backend Service name used by the Ingress.
>
> For the current Ingress example, the Service name should be:
>
> ```yaml
> name: visual-kube-app
> ```

### Verification

Check the Service status:

```bash
kubectl get services
```

Expected result:

```bash
NAME              TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE
visual-kube-app   ClusterIP   <cluster-ip>    <none>        80/TCP    10s
```

You can also inspect the Service:

```bash
kubectl describe service visual-kube-app
```

Expected result:

```bash
Name:              visual-kube-app
Type:              ClusterIP
Port:              <port-name>  80/TCP
TargetPort:        <container-port>/TCP
Endpoints:         <pod-ip>:<container-port>
```

## 5. Deploy the Application Ingress

Apply the Kubernetes Ingress manifest:

```bash
kubectl apply -f visual-kube-ingress.yaml
```

### Verification

Check the Ingress status:

```bash
kubectl get ingress
```

Expected result:

```bash
NAME            CLASS   HOSTS        ADDRESS        PORTS   AGE
myapp-ingress   nginx   myapp.test   <address>      80      10s
```

Describe the Ingress:

```bash
kubectl describe ingress myapp-ingress
```

Expected result:

```bash
Name:             myapp-ingress
Ingress Class:    nginx
Rules:
  Host        Path  Backends
  ----        ----  --------
  myapp.test  /     visual-kube-app:80
```

Then verify the application through Ingress by opening your browser and navigating to:

```
http://myapp.test
```

If the setup is correct, you should see the application response displayed in the browser.

## 6. Run the Client Prediction Service

Install dependencies if needed:

```bash
npm install
```

Start the client prediction service:

```bash
npm start
```

### Verification

The terminal should display basic prediction logs.

Example:

```bash
[Monitor Only] Current flow: 8463 B/s | TX: 7639 B/s | Predict: 12232.23 B/s | Recommended replicas: 3 | Scaling action is disabled.
```

## 7. Run the k6 Script

Run the k6 load test script:

```bash
k6 run realistic-load.js
```

### Verification

The terminal should display the k6 test report.

Example:

```bash
 █ TOTAL RESULTS

    checks_total.......: *****    *****/s
    checks_succeeded...: 100.00% ***** out of *****
    checks_failed......: 0.00%   0 out of *****
```
