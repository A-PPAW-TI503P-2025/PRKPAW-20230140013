const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || 'INI_ADALAH_KUNCI_RAHASIA_ANDA_YANG_SANGAT_AMAN';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res
      .status(401)
      .json({ message: "Akses ditolak. Token tidak disediakan." });
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Token tidak valid atau kedaluwarsa." });
    }
    req.user = userPayload;
    next();
  });
};

// Middleware 'isAdmin' sekarang akan memeriksa 'role' dari token
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res
      .status(403)
      .json({ message: "Akses ditolak. Hanya untuk admin." });
  }
};

// Middleware 'addUserData' untuk menambahkan data user dari token ke req.user
exports.addUserData = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log('addUserData - authHeader:', authHeader);
  console.log('addUserData - token:', token ? 'present' : 'missing');

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
      if (err) {
        console.error('addUserData - JWT verify error:', err.message);
      } else {
        console.log('addUserData - userPayload:', userPayload);
        req.user = userPayload;
      }
    });
  }
  next();
};
