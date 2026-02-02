const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://chemical-equipment-api-01hg.onrender.com/api';

export async function uploadCSV(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE_URL}/upload/`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      try {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.response);

          if (!data || typeof data !== 'object') {
            reject("Invalid response format from server");
            return;
          }

          if (data.total_equipment === 0 || !data.total_equipment) {
            reject("CSV file is empty or contains no valid equipment records");
            return;
          }

          resolve(data);
        } else if (xhr.status === 400) {
          const errorData = JSON.parse(xhr.response);
          reject(errorData.error || "Invalid CSV format or file is empty");
        } else if (xhr.status === 401 || xhr.status === 403) {
          reject("Authentication required. Please log in.");
        } else if (xhr.status >= 500) {
          reject("Server error. Please try again later.");
        } else {
          reject(`Upload failed with status ${xhr.status}`);
        }
      } catch (e) {
        reject("Failed to parse server response");
      }
    };

    xhr.onerror = () => {
      reject("Network error: Cannot connect to backend.");
    };

    xhr.ontimeout = () => {
      reject("Upload request timed out. Please try again.");
    };

    xhr.timeout = 60000;
    xhr.send(formData);
  });
}


export async function fetchHistory() {
  try {
    const response = await fetch(`${API_BASE_URL}/history/`);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication required. Please log in.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again later.");
      } else {
        throw new Error(`Failed to fetch history (${response.status})`);
      }
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Invalid history format from server");
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Cannot connect to backend.");
    }
    throw error;
  }
}
