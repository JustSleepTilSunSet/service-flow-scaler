/**
 * Given a series of Y values (traffic), assuming X is the time index [0, 1, 2...]
 * Returns the predicted next value.
 */
function getLinearPrediction(data) {
  const n = data.length;
  if (n < 2) return data[0] || 0;

  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += data[i];
    sumXY += i * data[i];
    sumXX += i * i;
  }

  // m = (n*ΣXY - ΣX*ΣY) / (n*ΣXX - (ΣX)^2)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  // b = (ΣY - m*ΣX) / n
  const intercept = (sumY - slope * sumX) / n;

  // y=mx+b
  return slope * n + intercept;
}

exports.getLinearPrediction = getLinearPrediction;
