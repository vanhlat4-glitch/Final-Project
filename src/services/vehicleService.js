import api, { RESOURCES } from "./api";

export const listVehicles = () => api.list(RESOURCES.VEHICLES);
export const createVehicle = (data) => api.create(RESOURCES.VEHICLES, data);
export const updateVehicle = (id, data) => api.update(RESOURCES.VEHICLES, id, data);
export const removeVehicle = (id) => api.remove(RESOURCES.VEHICLES, id);

export const approveVehicle = (id) => api.update(RESOURCES.VEHICLES, id, { status: "approved" });
export const rejectVehicle = (id) => api.update(RESOURCES.VEHICLES, id, { status: "rejected" });
