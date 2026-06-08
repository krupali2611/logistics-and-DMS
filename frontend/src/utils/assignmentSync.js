const VEHICLE_ASSIGNMENT_SYNC_KEY = 'logistics_dms_vehicle_assignment_sync';
export const VEHICLE_ASSIGNMENT_UPDATED_EVENT = 'vehicle-assignment-updated';

export const notifyVehicleAssignmentUpdated = () => {
  const timestamp = String(Date.now());
  window.dispatchEvent(new CustomEvent(VEHICLE_ASSIGNMENT_UPDATED_EVENT, { detail: timestamp }));
  window.localStorage.setItem(VEHICLE_ASSIGNMENT_SYNC_KEY, timestamp);
};

export const subscribeToVehicleAssignmentUpdates = (callback) => {
  const handleCustomEvent = () => callback();
  const handleStorageEvent = (event) => {
    if (event.key === VEHICLE_ASSIGNMENT_SYNC_KEY) {
      callback();
    }
  };

  window.addEventListener(VEHICLE_ASSIGNMENT_UPDATED_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(VEHICLE_ASSIGNMENT_UPDATED_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
