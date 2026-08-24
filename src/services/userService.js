import api, { RESOURCES } from "./api";

export const listProviders = () => api.list(RESOURCES.PROVIDERS);
export const createProvider = (data) => api.create(RESOURCES.PROVIDERS, data);
export const updateProvider = (id, data) => api.update(RESOURCES.PROVIDERS, id, data);
export const removeProvider = (id) => api.remove(RESOURCES.PROVIDERS, id);

export const listCustomers = () => api.list(RESOURCES.CUSTOMERS);
export const updateCustomer = (id, data) => api.update(RESOURCES.CUSTOMERS, id, data);
export const removeCustomer = (id) => api.remove(RESOURCES.CUSTOMERS, id);
