import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppToast from '../components/AppToast';
import { clearAuthError, registerUser } from '../features/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
  });

  useEffect(() => {
    dispatch(clearAuthError());

    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (error) {
      dispatch(clearAuthError());
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
      navigate('/login');
    } catch (registerError) {
      console.error(registerError);
    }
  };

  return (
    <>
      <AppToast message={error} variant="danger" onClose={() => dispatch(clearAuthError())} />

      <div className="container py-4" style={{ maxWidth: '560px' }}>
        <h2 className="mb-3">Register</h2>
        <form onSubmit={onSubmit} className="card shadow-sm border-0">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                className="form-control"
                id="username"
                value={formData.username}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, username: e.target.value }));
                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                className="form-control"
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, password: e.target.value }));
                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                className="form-select"
                value={formData.role}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, role: e.target.value }));
                  if (error) {
                    dispatch(clearAuthError());
                  }
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <button className="btn btn-success" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Register;
