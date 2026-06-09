const routeService = require('./routeService');

const calculateDistance = async ({ pickup, delivery }) => {
  const route = await routeService.calculateRoute({
    pickup,
    delivery
  });

  return {
    distance_km: route.distance_km,
    provider: route.provider
  };
};

module.exports = {
  calculateDistance
};
