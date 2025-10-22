import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Enable CORS for all origins (you can replace "*" with your GitHub Pages URL for more security)
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Hugging Face new endpoint (effective from Nov 2025)
const HF_BASE_URL = "https://router.huggingface.co/hf-inference";
const HF_MODEL = "distilgpt2"; // lightweight free model

// 🛟 Fallback racing tips
const FALLBACK_TIPS = [
  "Focus on consistent lap times rather than maximum speed.",
  "Practice cornering technique to improve overall lap efficiency.",
  "Monitor tire wear and adjust driving style accordingly.",
  "Use braking points wisely to maintain momentum.",
  "Analyze previous laps and identify areas for smooth acceleration."
];

app.post("/recommend", async (req, res) => {
  try {
    const userData = req.body;
    const prompt = `Give 1 short racing improvement tip for this performance data: ${JSON.stringify(userData)}`;

    // Call new Hugging Face Inference Providers API
    const response = await fetch(`${HF_BASE_URL}/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    // Try parsing the response
    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error("⚠️ Failed to parse JSON from Hugging Face:", err);
    }

    // If Hugging Face fails or returns no text, use fallback
    if (!data || !Array.isArray(data) || !data[0]?.generated_text) {
      const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      return res.json({ recommendation: fallback, source: "fallback" });
    }

    res.json({ recommendation: data[0].generated_text.trim(), source: "huggingface" });

  } catch (err) {
    console.error("❌ Error in /recommend:", err);
    const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    res.status(200).json({ recommendation: fallback, source: "fallback" });
  }
});

// ✅ Render assigns PORT dynamically
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
