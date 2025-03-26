const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your_jwt_secret_key';

app.use(cors());
app.use(express.json());

const users = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Токен отсутствует' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Невалидный токен' });
    req.user = user;
    next();
  });
};

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль' });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword
  };

  users.push(newUser);

  res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(user => user.username === username);

  if (!user) {
    return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({
    message: 'Вход выполнен успешно',
    token
  });
});

app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'Это защищенный ресурс',
    user: req.user
  });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});