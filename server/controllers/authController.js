const User = require('../models/User');
const { signToken } = require('../middleware/authMiddleware');

const createHttpError = (status, message, code) => {
  const err = new Error(message);
  err.status = status;
  if (code) {
    err.code = code;
  }
  return err;
};

const register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return next(createHttpError(400, 'Please enter username and password.', 'INVALID_AUTH_PAYLOAD'));
    }

    const existed = await User.findOne({ username });

    if (existed) {
      return next(createHttpError(409, 'Username already exists.', 'USERNAME_EXISTS'));
    }

    const user = await User.create({
      username,
      password,
      role: role === 'admin' ? 'admin' : 'user',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(createHttpError(400, 'Please enter username and password.', 'INVALID_AUTH_PAYLOAD'));
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return next(createHttpError(401, 'Invalid username or password.', 'INVALID_CREDENTIALS'));
    }

    if (typeof user.password !== 'string' || user.password.trim() === '') {
      return next(
        createHttpError(
          409,
          'This account uses an old login format. Please create a new account or reset this account.',
          'LEGACY_ACCOUNT_UNSUPPORTED'
        )
      );
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return next(createHttpError(401, 'Invalid username or password.', 'INVALID_CREDENTIALS'));
    }

    const token = signToken(user);
    const resolvedRole = user.role === 'admin' ? 'admin' : 'user';

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        _id: user._id,
        username: user.username,
        role: resolvedRole,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('_id username role');

    if (!user) {
      return next(
        createHttpError(401, 'Your session is no longer valid. Please sign in again.', 'AUTH_REQUIRED')
      );
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  me,
};
