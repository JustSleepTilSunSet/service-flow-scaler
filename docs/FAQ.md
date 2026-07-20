Q1: How to set `http://myapp.test/` URL for service?
A1:
Please follow the steps below:

1. To check a one terminal running `minikube tunnel`.
2. To check ingress status `kubectl get ingress -A`.
3. To check your `/etc/hosts`.

```
...(your default)
127.0.0.1 myapp.test
```

---

Q2: Why doesn't the pod reflect the latest code changes after rebuilding the Docker image?

A2: Kubernetes may still be using the old image tag or cached image. Rebuild the image with a new tag, update the deployment image tag, and then restart or redeploy the pod.

If you use Minikube as your Kubernetes environment, follow the steps below:

1. Remove the old image from Minikube if needed:

```bash
minikube image rm <your-image>:<old-tag>
```

2. Build the image with a new tag:

```bash
docker build -t <your-image>:<new-tag> .
```

3. Load the new image into Minikube:

```bash
minikube image load <your-image>:<new-tag>
```

4. Update the Kubernetes deployment to use the new image tag:

```bash
kubectl set image deployment/<deployment-name> <container-name>=<your-image>:<new-tag>
```

5. Verify the pod is using the new image:

```bash
kubectl rollout status deployment/<deployment-name>
kubectl describe pod <pod-name>
```

---
