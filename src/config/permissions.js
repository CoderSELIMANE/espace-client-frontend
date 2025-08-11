/**
 * Configuration des permissions de l'application
 */

export const PERMISSION_CONFIG = {
  // Mode de développement - permet à tous les utilisateurs d'ajouter des documents
  DEVELOPMENT_MODE: false, // Mode production : permissions strictes
  
  // Rôles autorisés à ajouter des documents
  ROLES_CAN_ADD_DOCUMENTS: ['admin', 'bibliothecaire'],
  
  // Rôles autorisés à modifier des documents
  ROLES_CAN_EDIT_DOCUMENTS: ['admin', 'bibliothecaire'],
  
  // Rôles autorisés à supprimer des documents
  ROLES_CAN_DELETE_DOCUMENTS: ['admin', 'bibliothecaire'],
  
  // Tous les utilisateurs connectés peuvent consulter les documents
  ALL_USERS_CAN_VIEW: true
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 * @param {Object} user - L'objet utilisateur
 * @param {string} permission - Le type de permission à vérifier
 * @returns {boolean} - True si l'utilisateur a la permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // En mode développement, autoriser tous les utilisateurs connectés
  if (PERMISSION_CONFIG.DEVELOPMENT_MODE && user) {
    console.log('🔧 Mode développement - Permission accordée pour:', permission);
    return true;
  }
  
  // Logique normale des permissions
  const userRole = getUserRole(user);
  
  switch (permission) {
    case 'add_documents':
      return PERMISSION_CONFIG.ROLES_CAN_ADD_DOCUMENTS.includes(userRole);
    case 'edit_documents':
      return PERMISSION_CONFIG.ROLES_CAN_EDIT_DOCUMENTS.includes(userRole);
    case 'delete_documents':
      return PERMISSION_CONFIG.ROLES_CAN_DELETE_DOCUMENTS.includes(userRole);
    case 'view_documents':
      return PERMISSION_CONFIG.ALL_USERS_CAN_VIEW;
    default:
      return false;
  }
};

/**
 * Obtient le rôle de l'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - Le rôle de l'utilisateur
 */
export const getUserRole = (user) => {
  if (!user) return 'guest';
  
  // Vérifications multiples pour détecter le rôle
  if (user.is_superuser || user.is_staff) return 'admin';
  if (user.profile && user.profile.user_type) return user.profile.user_type;
  if (user.role) return user.role;
  if (user.user_type) return user.user_type;
  
  return 'etudiant'; // Rôle par défaut
};
