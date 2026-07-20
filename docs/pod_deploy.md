### Steps:
  
  1. minikube start --driver=docker
  2. minikube tunnel
  3. Open other terminal.
  4. minikube image build -t {image-name}:latest .
  5. kubectl apply -f visual-kube-deployment.yaml