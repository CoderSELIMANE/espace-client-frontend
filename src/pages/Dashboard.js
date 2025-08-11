import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import documentService from '../services/documentService';
import ModernDocumentList from '../components/ModernDocumentList';
import DocumentUpload from '../components/DocumentUpload';
import SearchAndFilter from '../components/SearchAndFilter';


import SkeletonLoader from '../components/SkeletonLoader';
import Pagination from '../components/Pagination';
import HeroSection from '../components/HeroSection';
import ModernNavbar from '../components/ModernNavbar';
import FloatingActionButton from '../components/FloatingActionButton';

import SimpleDocumentViewer from '../components/SimpleDocumentViewer';

import usePagination from '../hooks/usePagination';
import { useApp } from '../contexts/AppContext';
import { getUserPermissions } from '../utils/permissions';


const Dashboard = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const navigate = useNavigate();
  const { state, actions } = useApp();

  // Obtenir les permissions de l'utilisateur
  const userPermissions = getUserPermissions(state.user);

  // Get filtered documents
  const filteredDocuments = actions.getFilteredDocuments();

  // Pagination
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    totalItems,
    goToPage,
    changeItemsPerPage
  } = usePagination(filteredDocuments, 6);

  useEffect(() => {
    // Vérifier l'authentification
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadUserData();
    loadDocuments();
  }, [navigate]);

  // Log de debug pour voir combien de documents sont reçus
  useEffect(() => {
    console.log('📊 Documents Dashboard:', {
      total: state.documents.length,
      filtered: filteredDocuments.length,
      paginated: paginatedData.length,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage
    });
  }, [state.documents, filteredDocuments, paginatedData, currentPage, totalPages, itemsPerPage]);

  const loadUserData = async () => {
    try {
      actions.setLoading(true);
      const userData = await authService.getProfile();
      actions.setUser(userData);
    } catch (err) {
      console.error('Erreur lors du chargement du profil:', err);
      actions.showNotification('error', 'Erreur lors du chargement du profil');
    } finally {
      actions.setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      console.log('🔄 Début du chargement des documents...');
      actions.setLoading(true);
      const documentsData = await documentService.getDocuments();
      console.log('📊 Données reçues du serveur:', documentsData);
      const documents = documentsData.results || documentsData;
      console.log('📋 Documents à définir:', documents);
      actions.setDocuments(documents);
      console.log('✅ Documents définis dans le contexte');
    } catch (err) {
      console.error('❌ Erreur lors du chargement des documents:', err);
      actions.showNotification('error', 'Erreur lors du chargement des documents');
    } finally {
      actions.setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleUploadSuccess = async (document) => {
    console.log('📄 Document ajouté avec succès:', document);
    setShowUpload(false);
    actions.showNotification('success', 'Document ajouté avec succès !');

    // Solution élégante : redirection vers la même page pour forcer le rechargement
    console.log('🔄 Redirection vers dashboard pour synchronisation...');
    navigate('/dashboard', { replace: true });

    // Forcer le rechargement des données après la navigation
    setTimeout(() => {
      loadDocuments();
    }, 100);
  };

  const handleViewDocument = (document) => {
    setViewingDocument(document);
  };

  const handleCloseViewer = () => {
    setViewingDocument(null);
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await documentService.deleteDocument(documentId);
      actions.removeDocument(documentId);
      // Recharger les documents pour s'assurer de la synchronisation
      await loadDocuments();
      actions.showNotification('success', 'Document supprimé avec succès !');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      actions.showNotification('error', 'Erreur lors de la suppression du document');
      throw err;
    }
  };

  const handleUpdateDocument = async () => {
    // Recharger les documents après une modification
    await loadDocuments();
  };

  if (state.loading && !state.user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }



  return (
    <div className="min-vh-100">
      {/* Modern Navbar */}
      <ModernNavbar />

      {/* Hero Section */}
      <HeroSection user={state.user} />

      {/* Main Content */}
      <div className="container py-4">




        {/* Search and Filter */}
        <SearchAndFilter />



        {/* Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="enhanced-title">
                <i className="fas fa-book-open me-2 text-primary"></i>
                Bibliothèque Partagée
                <span className="badge bg-primary ms-2 enhanced-badge">{totalItems}</span>
                {state.documents.length !== totalItems && (
                  <small className="text-muted ms-2">
                    (sur {state.documents.length} total)
                  </small>
                )}
              </h2>

              {userPermissions.canAdd && (
                <button
                  className="btn btn-success enhanced-btn"
                  onClick={() => setShowUpload(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Ajouter un document
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upload Modal - Seulement pour les admins */}
        {showUpload && userPermissions.canAdd && (
          <DocumentUpload
            onClose={() => setShowUpload(false)}
            onSuccess={handleUploadSuccess}
          />
        )}

        {/* Documents List */}
        <div className="row">
          <div className="col-12">
            {state.loading ? (
              <SkeletonLoader count={6} />
            ) : (
              <>
                <ModernDocumentList
                  documents={paginatedData}
                  onDelete={handleDeleteDocument}
                  onUpdate={handleUpdateDocument}
                  onView={handleViewDocument}
                />

                {/* Pagination */}
                {totalItems > 6 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={goToPage}
                    onItemsPerPageChange={changeItemsPerPage}
                  />
                )}
              </>
            )}
          </div>
        </div>



        {/* Floating Action Button - Seulement pour les admins */}
        {userPermissions.canAdd && (
          <FloatingActionButton
            onClick={() => setShowUpload(true)}
            icon="fas fa-plus"
            tooltip="Ajouter un document"
          />
        )}

        {/* Visualiseur de documents */}
        {viewingDocument && (
          <SimpleDocumentViewer
            document={viewingDocument}
            onClose={handleCloseViewer}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
