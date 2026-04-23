// 🚀 PRODUCTION URL (Change this once Render gives you a link)
const PROD_URL = "https://shadowtrace-backend.onrender.com"; 

// 📡 AUTOMATED FOR ANDROID: Using local IP 192.168.31.138
const LOCAL_URL = "http://192.168.31.138:8000"; 

export const API_URL = __DEV__ ? LOCAL_URL : PROD_URL;

export const analyzeSystem = async (telemetry) => {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(telemetry),
    });
    return await response.json();
  } catch (error) {
    console.error("Analysis failed", error);
    return null;
  }
};

export const fetchLogs = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/logs/${userId}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch logs", error);
    return { logs: [] };
  }
};

export const logActivity = async (entry) => {
  try {
    await fetch(`${API_URL}/log_activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    console.error("Failed to log activity", error);
  }
};
