// ==========================
// IMPORTS
// ==========================
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ==========================
// APP INIT
// ==========================
const app = express();

app.use(cors({
  origin: '*'
}));

app.use(express.json());

// ==========================
// MONGODB
// ==========================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Mongo connecté"))
  .catch(err => console.error("❌ Mongo error:", err));

// Schema flexible
const GameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', GameSchema);

// ==========================
// CLOUDINARY CONFIG
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// ==========================
// MULTER + CLOUDINARY STORAGE
// ==========================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ludotheque',
    resource_type: 'image'
  }
});

const upload = multer({ storage });

// ==========================
// ROUTES
// ==========================

// ✅ Test serveur
app.get('/', (req, res) => {
  res.send("✅ Backend Ludothèque OK");
});

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

// ✅ GET games
app.get('/games', async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur récupération games" });
  }
});

// ✅ POST save ALL (remplace tout)
app.post('/games', async (req, res) => {
  try {

    if (!Array.isArray(req.body)) {
      console.error("❌ Body invalide:", req.body);
      return res.status(400).json({ error: "Body must be an array" });
    }

    await Game.deleteMany({});
    await Game.insertMany(req.body);

    res.json({ message: "✅ Saved" });

  } catch (err) {
    console.error("❌ SAVE ERROR:", err);
    res.status(500).json({ error: "Erreur sauvegarde" });
  }
});

// ✅ DELETE 1 game
app.delete('/games/:id', async (req, res) => {
  try {
    await Game.deleteOne({ id: req.params.id });
    res.json({ message: "✅ Deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur suppression" });
  }
});

// ✅ UPLOAD IMAGE CLOUDINARY
app.post('/upload', upload.single('image'), (req, res) => {

  console.log("📷 FILE:", req.file);

  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier reçu" });
  }

  res.json({
    url: req.file.path // ✅ URL Cloudinary
  });
});

// ==========================
// SERVER
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
``