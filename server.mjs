import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Allow your front-end (GitHub Pages) to fetch data
app.use(cors({ origin: "*" }));
app.use(express.json());

const HF_MODEL = "distilgpt2"; // Free Hugging Face model

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

    // Fallback text
    const fallback = FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)];

    // Uncomment this section if you have a working Hugging Face key
    /*
    const response = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return res.json({ recommendation: data[0].generated_text.trim(), source: "huggingface" });
    }
    */

    // Return fallback if AI fails
    res.json({ recommendation: fallback, source: "fallback" });
  } catch (err) {
    console.error(err);
    res.json({ recommendation: FALLBACK_TIPS[Math.floor(Math.random() * FALLBACK_TIPS.length)], source: "fallback" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));