const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs/promises');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// Load user data from JSON file
const loadUserData = async () => {
  try {
    const data = await fs.readFile('Users.json', 'utf-8');
    const jsonData = JSON.parse(data);

    if (jsonData.users) {
      return jsonData.users;
    } else {
      return jsonData;
    }
  } catch (error) {
    return [];
  }
};

// Save user data to JSON file
const saveUserData = async (data) => {
  await fs.writeFile('Users.json', JSON.stringify({ users: data }, null, 2), 'utf-8');
};

// User Registration
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate if user exists
  const users = await loadUserData();
  const userExists = users.some((user) => user.email === email);

  if (!userExists) {
    const newUser = {
      user_id: Date.now(), // Using a timestamp as a unique identifier
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

// Fetch user data by email
app.get('/userdata/email/:email', async (req, res) => {
  const userEmail = req.params.email;

  try {
    const users = await loadUserData();
    const user = users.find((user) => user.email === userEmail);

    if (user) {
      res.status(200).json([user]); // Wrap user in an array
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
    const data = await fs.readFile('Products.json', 'utf-8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    console.error('Fetching error from API', error.message);
    res.status(500).send('API fetch error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
