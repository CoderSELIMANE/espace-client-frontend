import { api } from './authService';

class DocumentService {
  // Obtenir la liste des documents
  async getDocuments() {
    try {
      const response = await api.get('/documents/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Obtenir un document spécifique
  async getDocument(id) {
    try {
      const response = await api.get(`/documents/${id}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Uploader un nouveau document
  async uploadDocument(formData) {
    try {
      const response = await api.post('/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Modifier un document
  async updateDocument(id, data) {
    try {
      console.log('Mise à jour du document:', id, data);
      const response = await api.patch(`/documents/${id}/`, data);
      console.log('Réponse de mise à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      throw error.response?.data || error.message;
    }
  }

  // Supprimer un document
  async deleteDocument(id) {
    try {
      console.log('Suppression du document:', id);
      const response = await api.delete(`/documents/${id}/`);
      console.log('Document supprimé avec succès');
      return response.data || true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error.response?.data || error.message;
    }
  }



  // Télécharger un document
  async downloadDocument(id, filename) {
    try {
      const response = await api.get(`/documents/${id}/download/`, {
        responseType: 'blob',
      });

      // Obtenir le type MIME depuis les headers de la réponse
      const contentType = response.headers['content-type'] || 'application/octet-stream';

      // Créer un blob avec le bon type MIME
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      // Créer et déclencher le téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `document_${id}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw error;
    }
  }

  // Formater la taille du fichier
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Obtenir l'icône selon le type de fichier
  getFileIcon(extension) {
    const iconMap = {
      '.pdf': 'fas fa-file-pdf text-danger',
      '.doc': 'fas fa-file-word text-primary',
      '.docx': 'fas fa-file-word text-primary',
      '.txt': 'fas fa-file-alt text-secondary',
      '.jpg': 'fas fa-file-image text-success',
      '.jpeg': 'fas fa-file-image text-success',
      '.png': 'fas fa-file-image text-success',
      '.gif': 'fas fa-file-image text-success',
      '.zip': 'fas fa-file-archive text-warning',
      '.rar': 'fas fa-file-archive text-warning',
    };
    
    return iconMap[extension?.toLowerCase()] || 'fas fa-file text-muted';
  }
}

export default new DocumentService();
