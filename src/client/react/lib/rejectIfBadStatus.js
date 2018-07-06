export default response => (response.ok ? response : Promise.reject(response.status));
