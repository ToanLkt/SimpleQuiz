import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 text-center">
                <h1 className="mb-3">Quiz App</h1>
                <p className="text-muted mb-4">
                  Dang nhap de lam quiz hoac tao tai khoan moi.
                </p>
                <div className="d-grid gap-2 d-sm-flex justify-content-center">
                  <Link className="btn btn-primary" to="/login">
                    Login
                  </Link>
                  <Link className="btn btn-outline-secondary" to="/register">
                    Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
