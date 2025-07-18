// MOCK: funções antigas para evitar quebra
export const fetchBudgetItems = () => {
  console.warn('fetchBudgetItems mock usado');
  return Promise.resolve([]);
};

export const updateBudget = () => {
  console.warn('updateBudget mock usado');
};

export const db = {
  uploadQueue: {
    toArray: async () => [],
  },
};

export const getInsights = () => {
  console.warn('getInsights mock usado');
  return {};
};

export const processUploadQueue = () => {
  console.warn('processUploadQueue mock usado');
};

export const enqueueMediaUpload = () => {
  console.warn('enqueueMediaUpload mock usado');
};

export type IUploadQueueItem = any;
