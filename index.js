const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });
const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

// Servir frontend estático
app.use(express.static("public"));

// Ruta de transcripción
app.post("/transcribir", upload.single("audio"), async (req, res) => {
  const filePath = req.file.path;
  const mimetype = req.file.mimetype;

  try {
    const audioBuffer = fs.readFileSync(filePath);

    const response = await axios.post("https://api.deepgram.com/v1/listen", audioBuffer, {
      headers: {
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
        "Content-Type": mimetype,
      },
      params: {
        language: "es",
        punctuate: true,
      },
    });

    const transcript = response.data.results.channels[0].alternatives[0].transcript;
    res.json({ transcripcion: transcript });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error al transcribir audio" });
  } finally {
    fs.unlinkSync(filePath); // Borrar archivo temporal
  }
});

app.listen(3000, () => {
  console.log("🟢 Servidor en: http://localhost:3000");
});
