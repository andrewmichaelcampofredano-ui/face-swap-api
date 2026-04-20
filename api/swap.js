export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, video } = req.body;

    // Create prediction
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "latest",
        input: {
          source_image: image,
          target_video: video,
        },
      }),
    });

    let prediction = await response.json();

    // Poll until complete
    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await new Promise((r) => setTimeout(r, 2000));

      const poll = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });

      prediction = await poll.json();
    }

    if (prediction.status === "failed") {
      return res.status(500).json({ error: "AI processing failed" });
    }

    return res.status(200).json({
      video: prediction.output,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}export default async 
