const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs/promises');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

const FS = require('fs');

// Load user data from JSON file
const loadUserData = async () => {
  try {
    const data = await fs.readFile('users.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Save user data to JSON file
const saveUserData = async (data) => {
  await fs.writeFile('users.json', JSON.stringify(data, null, 2), 'utf8');
};

// User Registration
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate if user exists
  const users = await loadUserData();
  const userExists = users.some((user) => user.email === email);

  if (!userExists) {
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
    };

    users.push(newUser);
    await saveUserData(users);

    res.json({ success: true, message: 'User registered successfully' });
  } else {
    res.status(400).json({ success: false, message: 'User already exists' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  const users = await loadUserData();
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    res.json({ success: true, message: 'Login successful', user });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

app.get('/userdata/email/:email', async (req, res) => {
  const userEmail = req.params.email;

  try {
    const users = await loadUserData();
    const user = users.find(user => user.email === userEmail);

    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Product Fetching
app.get('/:limit', async (req, res) => {
  const { limit } = req.params;
  try {
    FS.readFile('Products.json', 'utf-8', (error, data) => {
      const d = JSON.parse(data);
      res.json(d);
    });
  } catch (error) {
    console.error('Fetching error from API', error.message);
    res.status(500).send('API fetch error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
