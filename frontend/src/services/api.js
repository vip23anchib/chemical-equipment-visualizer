export async function uploadCSV(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "http://127.0.0.1:8000/api/upload/");

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
          
          // Validate response has required fields
          if (!data || typeof data !== 'object') {
            reject("Invalid response format from server");
            return;
          }
          
          // Check for empty dataset
          if (data.total_equipment === 0 || !data.total_equipment) {
            reject("CSV file is empty or contains no valid equipment records");
            return;
          }
          
          resolve(data);
        } else if (xhr.status === 400) {
          // Bad request - likely invalid CSV format
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
      reject("Network error: Cannot connect to backend. Is the server running?");
    };

    xhr.ontimeout = () => {
      reject("Upload request timed out. Please try again.");
    };

    xhr.timeout = 60000; // 60 second timeout
    xhr.send(formData);
  });
}


export async function fetchHistory() {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/history/");
    
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
    
    // Validate response is an array
    if (!Array.isArray(data)) {
      throw new Error("Invalid history format from server");
    }
    
    // Return empty array if no history, don't throw
    return data;
  } catch (error) {
    // If network error, provide helpful message
    if (error instanceof TypeError) {
      throw new Error("Cannot connect to backend. Is the Django server running on port 8000?");
    }
    throw error;
  }
}

