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
// INIT
// ==========================
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// ==========================
// MONGODB
// ==========================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Mongo connecté"))
  .catch(err => console.error("❌ Mongo error:", err));

const GameSchema = new mongoose.Schema({}, { strict: false });
const Game = mongoose.model('Game', GameSchema);

// ==========================
// CLOUDINARY
// ==========================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

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

// Test
app.get('/', (req, res) => {
  res.send("✅ Backend Ludothèque OK");
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

// ✅ GET games (trié)
app.get('/games', async (req, res) => {
  try {
    const games = await Game.find().sort({ title: 1 });
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: "Erreur récupération" });
  }
});

// ✅ CREATE game
app.post('/games', async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.json(game);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur création" });
  }
});

// ✅ UPDATE game
app.put('/games/:id', async (req, res) => {
  try {

    if (!req.body.id) {
      return res.status(400).json({ error: "ID manquant" });
    }

    const updated = await Game.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true } // ❌ enlever upsert
    );

    if (!updated) {
      return res.status(404).json({ error: "Jeu introuvable" });
    }

    res.json(updated);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur update" });
  }
});

// ✅ DELETE game
app.delete('/games/:id', async (req, res) => {
  try {
    await Game.deleteOne({ id: req.params.id });
    res.json({ message: "✅ Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Erreur suppression" });
  }
});

// ✅ UPLOAD IMAGE
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file" });
  }

  res.json({ url: req.file.path });
});

// ==========================
// SERVER
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});