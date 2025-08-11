import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger si déjà connecté
    if (authService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur du champ modifié
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await authService.register(formData);
      navigate('/dashboard');
    } catch (err) {
      setErrors(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <h2 className="card-title">
                    <i className="fas fa-user-plus text-success me-2"></i>
                    Inscription
                  </h2>
                  <p className="text-muted">Créez votre espace client</p>
                </div>

                {errors.non_field_errors && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.non_field_errors[0]}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="first_name" className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Prénom
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        placeholder="Votre prénom"
                      />
                      {errors.first_name && (
                        <div className="invalid-feedback">
                          {errors.first_name[0]}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="last_name" className="form-label">
                        <i className="fas fa-user me-2"></i>
                        Nom
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        placeholder="Votre nom"
                      />
                      {errors.last_name && (
                        <div className="invalid-feedback">
                          {errors.last_name[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="fas fa-envelope me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <div className="invalid-feedback">
                        {errors.email[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone_number" className="form-label">
                      <i className="fas fa-phone me-2"></i>
                      Numéro de téléphone
                    </label>
                    <input
                      type="tel"
                      className={`form-control ${errors.phone_number ? 'is-invalid' : ''}`}
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="0123456789 ou +33123456789"
                    />
                    {errors.phone_number && (
                      <div className="invalid-feedback">
                        {errors.phone_number[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Votre mot de passe"
                    />
                    {errors.password && (
                      <div className="invalid-feedback">
                        {errors.password[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password_confirm" className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Confirmer le mot de passe
                    </label>
                    <input
                      type="password"
                      className={`form-control ${errors.password_confirm ? 'is-invalid' : ''}`}
                      id="password_confirm"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      required
                      placeholder="Confirmez votre mot de passe"
                    />
                    {errors.password_confirm && (
                      <div className="invalid-feedback">
                        {errors.password_confirm[0]}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Inscription...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>
                        S'inscrire
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="mb-0">
                    Déjà un compte ?{' '}
                    <Link to="/login" className="text-decoration-none">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
