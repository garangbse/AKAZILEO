import { api, fileToBase64 } from './api';

export const createPortfolioItem = async (
  itemData: {
    title: string;
    description: string;
    project_link: string;
    media_file: File | null;
  },
  token?: string
) => {
  let media_file_base64 = null;
  
  // Convert file to base64 if provided
  if (itemData.media_file) {
    media_file_base64 = await fileToBase64(itemData.media_file);
  }
  
  return api('/portfolio', 'POST', {
    title: itemData.title,
    description: itemData.description,
    project_link: itemData.project_link,
    media_file: media_file_base64,
  }, token);
};

export const getUserPortfolio = async (userId: number, token?: string) => {
  return api(`/portfolio/${userId}`, 'GET', undefined, token);
};

export const deletePortfolioItem = async (itemId: number, token?: string) => {
  return api(`/portfolio/${itemId}`, 'DELETE', undefined, token);
};
