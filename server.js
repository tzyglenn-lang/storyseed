import express from "express"
import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel
} from "@qvac/sdk"

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static("public"))

let modelId = null

async function startModel() {
  console.log("Loading QVAC model...")

  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (progress) => {
      if (progress.percentage) {
        console.log(`Model loading: ${progress.percentage}%`)
      }
    }
  })

  console.log("QVAC model ready!")
}

app.post("/generate", async (req, res) => {
  try {
    const { words } = req.body

    if (!Array.isArray(words) || words.length !== 3) {
      return res.status(400).json({
        error: "Please provide exactly 3 words."
      })
    }

    const prompt = `
You are StorySeed, a creative story generator.

Create a short, fun, original story using these three words:

${words.map((word, i) => `${i + 1}. ${word}`).join("\n")}

Format your response like this:

Title: [creative title]

Story:
[write the complete story in 3-5 paragraphs]

Make sure all three words are naturally included in the story.
`

    const result = completion({
      modelId,
      history: [
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true
    })

    let story = ""

for await (const token of result.tokenStream) {
  story += token
}

story = story
  .replace(/\*\*/g, "")
  .replace(/^Title:\s*/i, "")

    res.json({ story })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: "Story generation failed."
    })
  }
})

async function main() {
  await startModel()

  app.listen(PORT, () => {
    console.log(`\nStorySeed is running at http://localhost:${PORT}`)
  })
}

main()

process.on("SIGINT", async () => {
  console.log("\nShutting down...")

  if (modelId) {
    await unloadModel({ modelId })
  }

  process.exit(0)
})