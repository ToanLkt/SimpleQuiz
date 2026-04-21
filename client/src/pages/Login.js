import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AppToast from '../components/AppToast';
import { clearAuthError, loginUser } from '../features/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    dispatch(clearAuthError());

    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const clearErrorState = () => {
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    clearErrorState();

    try {
      const response = await dispatch(loginUser({ username, password })).unwrap();
      const role = response?.data?.role;

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/quizzes');
      }
    } catch (loginError) {
      console.error(loginError);
    }
  };

  return (
    <>
      <AppToast message={error} variant="danger" onClose={clearErrorState} />

      <div className="container py-4" style={{ maxWidth: '520px' }}>
        <h2 className="mb-3">Login</h2>
        <form onSubmit={onSubmit} className="card shadow-sm border-0">
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearErrorState();
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
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearErrorState();
                }}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => navigate('/register')}
              >
                Chua co tai khoan? Dang ky
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
