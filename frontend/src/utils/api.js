// // frontend/src/utils/api.js
// const MAX_RETRIES = 3;
// const RETRY_DELAY = 1000; // 1 giây

// export const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
//   try {
//     const response = await fetch(url, options);

//     // Kiểm tra health check nếu nhận được 404
//     if (response.status === 404) {
//       const healthCheck = await fetch("/health");
//       if (!healthCheck.ok) {
//         throw new Error("Server not responding");
//       }
//     }

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return response;
//   } catch (error) {
//     if (retries > 0) {
//       console.log(`Retrying... ${retries} attempts left`);
//       await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//       return fetchWithRetry(url, options, retries - 1);
//     }
//     throw error;
//   }
// };
