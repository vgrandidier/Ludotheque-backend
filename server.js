const express = require('express');
//const fs = require('fs');
const cors = require('cors');

const app = express();


const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Mongo connecté"));

  
const GameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', GameSchema)


app.use(cors({
  origin: '*'
}));

app.use(express.json());
app.use('/images', express.static('images'));

// ✅ Lire les données
/*app.get('/games', (req, res) => {
  const data = fs.readFileSync('games.json');
  res.json(JSON.parse(data));
});*/
app.get('/games', async (req, res) => {
  const games = await Game.find();
  res.json(games);
});


app.get('/', (req, res) => {
  res.send("✅ Backend Ludothèque en ligne !");
});


app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});


/*app.post('/games', (req, res) => {
  const games = req.body;

});

// ✅ Sauvegarder toutes les données
  fs.writeFileSync('games.json', JSON.stringify(games, null, 2));

  res.json({ message: "Sauvegarde OK" });
});*/
app.post('/games', async (req, res) => {
  await Game.deleteMany({});
  await Game.insertMany(req.body);
  res.json({ message: "Saved" });
});

// ✅ Supprimer un jeu
/*app.delete('/games/:id', (req, res) => {
  const id = req.params.id;

  let games = JSON.parse(fs.readFileSync('games.json'));

  games = games.filter(g => g.id !== id);

  fs.writeFileSync('games.json', JSON.stringify(games, null, 2));

  res.json({ message: "Supprimé" });
});*/
app.delete('/games/:id', async (req, res) => {
  await Game.deleteOne({ id: req.params.id });
  res.json({ message: "Deleted" });
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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on", PORT);
});

// =====================
// CLOUDINARY FOR IMAGES
// =====================
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const { CloudinaryStorage } = require('multer-storage-cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ludotheque',
    resource_type: 'image'
  }
});


const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    url: req.file.path // ✅ URL Cloudinary directe
  });
});
