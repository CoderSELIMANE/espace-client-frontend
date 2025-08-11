import React from 'react';
import { useApp } from '../contexts/AppContext';

const NotificationToast = () => {
  const { state, actions } = useApp();

  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case 'success':
        return 'toast-success';
      case 'error':
        return 'toast-error';
      case 'warning':
        return 'toast-warning';
      case 'info':
        return 'toast-info';
      default:
        return 'toast-info';
    }
  };

  if (state.notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {state.notifications.map((notification) => (
        <div
          key={notification.id}
          className={`toast show ${getToastClass(notification.type)}`}
          role="alert"
        >
          <div className="toast-header">
            <i className={`${getToastIcon(notification.type)} me-2`}></i>
            <strong className="me-auto">
              {notification.title || notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
            </strong>
            <button
              type="button"
              className="btn-close"
              onClick={() => actions.removeNotification(notification.id)}
            ></button>
          </div>
          <div className="toast-body">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
