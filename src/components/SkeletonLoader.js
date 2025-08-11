import React from 'react';

const SkeletonLoader = ({ count = 6 }) => {
  return (
    <div className="row">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="col-md-6 col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="skeleton" style={{ width: '70%', height: '24px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '10px' }}></div>
              </div>
              
              <div className="skeleton mb-2" style={{ width: '100%', height: '16px', borderRadius: '4px' }}></div>
              <div className="skeleton mb-3" style={{ width: '80%', height: '16px', borderRadius: '4px' }}></div>
              
              <div className="d-flex justify-content-between">
                <div className="skeleton" style={{ width: '40%', height: '14px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '30%', height: '14px', borderRadius: '4px' }}></div>
              </div>
            </div>
            
            <div className="card-footer bg-transparent">
              <div className="d-flex gap-2">
                <div className="skeleton flex-fill" style={{ height: '32px', borderRadius: '4px' }}></div>
                <div className="skeleton flex-fill" style={{ height: '32px', borderRadius: '4px' }}></div>
                <div className="skeleton flex-fill" style={{ height: '32px', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
