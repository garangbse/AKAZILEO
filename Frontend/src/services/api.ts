const BASE_URL = "http://127.0.0.1:5000";

export const api = async (
  endpoint: string,
  method: string,
  body?: any,
  token?: string
) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
};

// For file uploads - converts file to base64
export const apiWithFile = async (
  endpoint: string,
  method: string,
  body: any,
  token?: string
) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  return res.json();
};

// Helper to convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 part (remove data:image/png;base64, prefix)
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

// Delete user account
export const deleteUserAccount = async (userId: number, token: string) => {
  return api(`/users/${userId}`, 'DELETE', undefined, token);
};

// Change password
export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
  token: string
) => {
  return api(`/users/${userId}/change-password`, 'PATCH', {
    current_password: currentPassword,
    new_password: newPassword,
  }, token);
};


