import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const HF_MODEL = "distilgpt2"; // Free Hugging Face model

// Safe fallback tips
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

    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error("Failed to parse JSON from Hugging Face:", err);
    }

    // If Hugging Face fails or returns no text, use fallback
    if (!data || !Array.isArray(data) || !data[0]?.generated_text) {
      const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
      return res.json({ recommendation: fallback, source: "fallback" });
    }

    res.json({ recommendation: data[0].generated_text.trim(), source: "huggingface" });
  } catch (err) {
    console.error(err);
    // Return a fallback tip if anything goes wrong
    const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];
    res.status(200).json({ recommendation: fallback, source: "fallback" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
