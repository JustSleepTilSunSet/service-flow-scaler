# Monitor k8s.
# Get POD network traffic rate (B/s) by reading /sys/class/net/eth0/statistics/rx_bytes and /sys/class/net/eth0/statistics/tx_bytes.
NS="${1:-default}"
POD="${2:?pod is required}"
prev_rx=0; prev_tx=0; prev_t=$(date +%s)
while true; do
  now_t=$(date +%s)
  out=$(kubectl -n "$NS" exec "$POD" -- sh -c 'cat /sys/class/net/eth0/statistics/rx_bytes; cat /sys/class/net/eth0/statistics/tx_bytes' 2>/dev/null)
  rx=$(echo "$out" | sed -n '1p')
  tx=$(echo "$out" | sed -n '2p')

  dt=$((now_t - prev_t))
  if [ "$prev_rx" != "0" ] && [ "$dt" -gt 0 ]; then
    drx=$((rx - prev_rx))
    dtx=$((tx - prev_tx))
    # echo "$(date +%T) rx=${rx} tx=${tx}  rx_rate=$((drx/dt)) B/s  tx_rate=$((dtx/dt)) B/s"
    echo "$((drx/dt)),$((dtx/dt))"
  fi

  prev_rx=$rx; prev_tx=$tx; prev_t=$now_t

  # Sampling Frequency, default 5s.
  sleep 5
done
