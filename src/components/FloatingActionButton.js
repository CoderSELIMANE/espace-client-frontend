import React, { useState } from 'react';

const FloatingActionButton = ({ onClick, icon = "fas fa-plus", tooltip = "Ajouter" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="floating-action-container">
      <button
        className={`floating-action-button ${isHovered ? 'hovered' : ''}`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={tooltip}
      >
        <i className={icon}></i>
        <span className="fab-ripple"></span>
      </button>
      
      {isHovered && (
        <div className="fab-tooltip">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default FloatingActionButton;
