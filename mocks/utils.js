const fs = require('fs')
const path = require('path')

const mswDataPath = path.join(__dirname, `./fixtures/data.json`)

const clearingFixture = fs.promises.writeFile(mswDataPath, '{}')

async function updateFixture(updates) {
  const mswData = await readFixture()
  await fs.promises.writeFile(
    mswDataPath,
    JSON.stringify({ ...mswData, ...updates }, null, 2),
  )
}

async function readFixture() {
  await clearingFixture
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mswData = {}
  try {
    const contents = await fs.promises.readFile(mswDataPath)
    mswData = JSON.parse(contents.toString())
  } catch (error) {
    console.error(
      `Error reading and parsing the msw fixture. Clearing it.`,
      error.stack ?? error,
    )
    await fs.promises.writeFile(mswDataPath, '{}')
  }
  return mswData
}

module.exports = {
  readFixture,
  updateFixture,
}
