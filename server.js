const express = require('express');
const fs = require('fs');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Lire les données
app.get('/games', (req, res) => {
  const data = fs.readFileSync('games.json');
  res.json(JSON.parse(data));
});

app.get('/', (req, res) => {
  res.send("✅ Backend Ludothèque en ligne !");
});

app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

// ✅ Sauvegarder toutes les données
app.post('/games', (req, res) => {
  const games = req.body;

  fs.writeFileSync('games.json', JSON.stringify(games, null, 2));

  res.json({ message: "Sauvegarde OK" });
});

// ✅ Supprimer un jeu
app.delete('/games/:id', (req, res) => {
  const id = req.params.id;

  let games = JSON.parse(fs.readFileSync('games.json'));

  games = games.filter(g => g.id !== id);

  fs.writeFileSync('games.json', JSON.stringify(games, null, 2));

  res.json({ message: "Supprimé" });
});

// Uploader les images
const multer = require('multer');
const path = require('path');

// ✅ configuration stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // ✅ IMPORTANT
  }
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    filename: req.file.filename
  });
});

app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000');
});
