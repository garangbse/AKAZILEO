import { api, fileToBase64 } from './api';

export const createTask = async (
  taskData: {
    title: string;
    description: string;
    payment: number;
    due_date?: string;
  },
  token?: string
) => {
  return api('/tasks', 'POST', taskData, token);
};

export const getTasks = async (token?: string) => {
  return api('/tasks', 'GET', undefined, token);
};

export const getTaskById = async (id: number, token?: string) => {
  return api(`/tasks/${id}`, 'GET', undefined, token);
};

export const applyToTask = (taskId: number, token?: string) => {
  return api(`/tasks/${taskId}/apply`, 'POST', {}, token);
};

export const getTaskApplications = async (taskId: number, token?: string) => {
  return api(`/tasks/${taskId}/applications`, 'GET', undefined, token);
};

export const acceptApplication = async (id: number, token?: string) => {
  return api(`/applications/${id}/accept`, 'POST', {}, token);
};

export const rejectApplication = async (id: number, token?: string) => {
  return api(`/applications/${id}/reject`, 'POST', {}, token);
};

export const getTaskWorkers = async (taskId: number, token?: string) => {
  return api(`/tasks/${taskId}/workers`, 'GET', undefined, token);
};

export const getUserApplications = async (token?: string) => {
  return api('/user/applications', 'GET', undefined, token);
};

export const getNotifications = async (token?: string) => {
  return api('/notifications', 'GET', undefined, token);
};

export const markNotificationRead = async (notificationId: number, token?: string) => {
  return api(`/notifications/${notificationId}/read`, 'POST', {}, token);
};

export const getAcceptedTasks = async (token?: string) => {
  return api('/user/accepted-tasks', 'GET', undefined, token);
};

export const getTasksByPosterId = async (posterId?: number, token?: string) => {
  if (!posterId) return { status: 'error', data: [] };
  return api(`/tasks?poster_id=${posterId}`, 'GET', undefined, token);
};

// Submission functions
export const submitTask = async (
  taskId: number,
  submissionData: {
    submission_text: string;
    submission_file: File | null;
  },
  token?: string
) => {
  let submission_file_base64 = null;
  
  // Convert file to base64 if provided
  if (submissionData.submission_file) {
    submission_file_base64 = await fileToBase64(submissionData.submission_file);
  }
  
  return api(`/tasks/${taskId}/submit`, 'POST', {
    submission_text: submissionData.submission_text,
    submission_file: submission_file_base64,
    file_name: submissionData.submission_file?.name || null,
    file_type: submissionData.submission_file?.type || null,
  }, token);
};

export const getTaskSubmissions = async (taskId: number, token?: string) => {
  return api(`/tasks/${taskId}/submissions`, 'GET', undefined, token);
};

export const approveSubmission = async (taskId: number, submissionId: number, token?: string) => {
  return api(`/tasks/${taskId}/submissions/${submissionId}`, 'PATCH', { status: 'approved' }, token);
};

export const rejectSubmission = async (taskId: number, submissionId: number, token?: string) => {
  return api(`/tasks/${taskId}/submissions/${submissionId}`, 'PATCH', { status: 'rejected' }, token);
};