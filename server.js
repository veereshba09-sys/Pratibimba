const express = require("express");
const textToSpeech = require("@google-cloud/text-to-speech");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8082;

const client = new textToSpeech.TextToSpeechClient();

app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/voice", async (req, res) => {
    try {
        const text = req.body.text;

        if (!text) {
            return res.status(400).json({
                error: "No text received"
            });
        }

        const request = {
            input: {
                text: text
            },

            voice: {
                languageCode: "kn-IN",
                name: "kn-IN-Chirp3-HD-Erinome"
            },

            audioConfig: {
                audioEncoding: "MP3",
                speakingRate: 0.95,
                pitch: 1.0
            }
        };

        const [response] =
            await client.synthesizeSpeech(request);

        res.set({
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-cache"
        });

        res.send(response.audioContent);

    } catch (error) {

        console.error("TTS ERROR:", error);

        res.status(500).json({
            error: "Voice generation failed"
        });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prathibimba running on port ${PORT}`);
});