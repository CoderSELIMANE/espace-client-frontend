/**
 * Utilitaires pour la gestion des permissions dans l'espace client
 */
// import { hasPermission, getUserRole, PERMISSION_CONFIG } from '../config/permissions';

/**
 * Vérifie si l'utilisateur est un administrateur
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est un administrateur
 */
export const isAdmin = (user) => {
  if (!user) return false;

  // Vérifications multiples pour être sûr
  const isSuperUser = user.is_superuser === true;
  const isStaff = user.is_staff === true;
  const isAdminProfile = user.profile && user.profile.user_type === 'admin';
  const isAdminRole = user.role === 'admin';
  const isAdminType = user.user_type === 'admin';

  return isSuperUser || isStaff || isAdminProfile || isAdminRole || isAdminType;
};

/**
 * Vérifie si l'utilisateur est un bibliothécaire
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est un bibliothécaire
 */
export const isLibrarian = (user) => {
  if (!user) return false;
  return user.profile && user.profile.user_type === 'bibliothecaire';
};

/**
 * Vérifie si l'utilisateur peut ajouter des documents
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur peut ajouter des documents
 */
export const canAddDocuments = (user) => {
  if (!user) return false;

  // Solution temporaire : permettre aux utilisateurs avec certains emails d'être admin
  const adminEmails = ['azize@gmail.com', 'admin@gmail.com'];
  if (adminEmails.includes(user.email)) {
    return true;
  }

  // NOUVELLE RÈGLE : Seuls les admins peuvent ajouter des documents
  return isAdmin(user);
};

/**
 * Vérifie si l'utilisateur peut modifier des documents
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur peut modifier des documents
 */
export const canEditDocuments = (user) => {
  if (!user) return false;

  // Solution temporaire : permettre aux utilisateurs avec certains emails d'être admin
  const adminEmails = ['azize@gmail.com', 'admin@gmail.com'];
  if (adminEmails.includes(user.email)) {
    return true;
  }

  // NOUVELLE RÈGLE : Seuls les admins peuvent modifier des documents
  return isAdmin(user);
};

/**
 * Vérifie si l'utilisateur peut supprimer des documents
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur peut supprimer des documents
 */
export const canDeleteDocuments = (user) => {
  if (!user) return false;

  // Solution temporaire : permettre aux utilisateurs avec certains emails d'être admin
  const adminEmails = ['azize@gmail.com', 'admin@gmail.com'];
  if (adminEmails.includes(user.email)) {
    return true;
  }

  // NOUVELLE RÈGLE : Seuls les admins peuvent supprimer des documents
  return isAdmin(user);
};

/**
 * Vérifie si l'utilisateur peut consulter des documents
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur peut consulter des documents
 */
export const canViewDocuments = (user) => {
  // NOUVELLE RÈGLE : Tous les utilisateurs connectés peuvent lire les documents
  return user !== null && user !== undefined;
};

/**
 * Vérifie si l'utilisateur peut télécharger des documents
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur peut télécharger des documents
 */
export const canDownloadDocuments = (user) => {
  // NOUVELLE RÈGLE : Tous les utilisateurs connectés peuvent télécharger les documents
  return user !== null && user !== undefined;
};

/**
 * Vérifie si l'utilisateur est un étudiant/utilisateur normal
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est un étudiant
 */
export const isStudent = (user) => {
  if (!user) return false;
  return !isAdmin(user) && !isLibrarian(user);
};

/**
 * Obtient le type d'utilisateur pour l'affichage
 * @param {Object} user - L'objet utilisateur
 * @returns {string} - Le type d'utilisateur
 */
export const getUserType = (user) => {
  if (!user) return 'Invité';

  // Vérification par email pour les admins connus
  const adminEmails = ['azize@gmail.com', 'admin@gmail.com'];
  if (adminEmails.includes(user.email)) {
    return 'Administrateur';
  }

  if (isAdmin(user)) return 'Administrateur';
  if (isLibrarian(user)) return 'Bibliothécaire';
  return 'Utilisateur';
};

/**
 * Obtient les permissions de l'utilisateur
 * @param {Object} user - L'objet utilisateur
 * @returns {Object} - Objet contenant les permissions
 */
export const getUserPermissions = (user) => {
  return {
    canAdd: canAddDocuments(user),
    canEdit: canEditDocuments(user),
    canDelete: canDeleteDocuments(user),
    canView: canViewDocuments(user),
    canDownload: canDownloadDocuments(user),
    isAdmin: isAdmin(user),
    isLibrarian: isLibrarian(user),
    isStudent: isStudent(user),
    userType: getUserType(user)
  };
};
