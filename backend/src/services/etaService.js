const roundToWhole = (value) => Math.max(0, Math.round(Number(value || 0)));

const calculateEstimatedEta = ({ durationMinutes, departureAt = new Date() }) => {
  const safeDuration = roundToWhole(durationMinutes);
  const startTime = departureAt instanceof Date ? departureAt : new Date(departureAt);
  const startTimestamp = Number.isNaN(startTime.getTime()) ? Date.now() : startTime.getTime();

  return new Date(startTimestamp + safeDuration * 60 * 1000);
};

module.exports = {
  calculateEstimatedEta
};
