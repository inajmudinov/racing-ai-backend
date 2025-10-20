import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Enable CORS for all origins (replace "*" with your GitHub Pages URL in production)
app.use(cors({ origin: "*" }));
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

    let recommendation = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];

    // Try Hugging Face API if key is provided
    if (process.env.HUGGINGFACE_API_KEY) {
      try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();
        if (Array.isArray(data) && data[0]?.generated_text) {
          recommendation = data[0].generated_text.trim();
        }
      } catch (hfErr) {
        console.error("HuggingFace failed, using fallback:", hfErr);
      }
    }

    res.json({ recommendation, source: "fallback" });
  } catch (err) {
    console.error(err);
    res.status(200).json({ recommendation: FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)], source: "fallback" });
  }
});

// Port from Render or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));