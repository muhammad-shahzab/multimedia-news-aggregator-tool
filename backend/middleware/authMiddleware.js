import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: 'Missing token' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: 'Invalid token' });

    req.userId = decoded.id;
    next();
  });
}