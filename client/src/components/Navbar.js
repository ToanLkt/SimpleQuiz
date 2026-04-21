import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return null;
  }

  const role = user?.role || 'user';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to={role === 'admin' ? '/admin/dashboard' : '/quizzes'}>
          Quiz App
        </Link>
        <div className="collapse navbar-collapse show">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {role === 'admin' ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/manage-quizzes">
                    Quan ly Quiz
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/manage-questions">
                    Quan ly Cau hoi
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/quizzes">
                    Danh sach Quiz
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/leaderboard/ALL">
                    Bang xep hang
                  </Link>
                </li>
              </>
            )}
          </ul>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
