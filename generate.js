import readline from "readline"
import {
  loadModel,
  LLAMA_3_2_1B_INST_Q4_0,
  completion,
  unloadModel
} from "@qvac/sdk"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const ask = (question) => new Promise(resolve => rl.question(question, resolve))

let modelId = null

try {
  console.log("\n🌱 StorySeed")
  console.log("Plant 3 words. Grow a story.")
  console.log('Type "exit" anytime to quit.\n')

  console.log("Loading QVAC model...")

  modelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0
  })

  console.log("QVAC model ready!\n")

  while (true) {
    const word1 = await ask("Word 1: ")

    if (word1.toLowerCase() === "exit") break

    const word2 = await ask("Word 2: ")

    if (word2.toLowerCase() === "exit") break

    const word3 = await ask("Word 3: ")

    if (word3.toLowerCase() === "exit") break

    console.log("\n🌱 Growing your story...\n")

    const prompt = `
You are StorySeed, a creative story generator.

Create a short, fun, original story using these three words:

1. ${word1}
2. ${word2}
3. ${word3}

Give the story a creative title and write 3-5 short paragraphs.
Make sure all three words are naturally included.
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

    story = story.replace(/\*\*/g, "")

    console.log(story)
    console.log("\n----------------------------------------\n")
  }

} catch (error) {
  console.error("\nError:", error)

} finally {
  if (modelId) {
    await unloadModel({ modelId })
  }

  rl.close()
  console.log("StorySeed closed. 👋")
}