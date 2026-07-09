const fs = require("fs")

function parseJsonWithTrailingCommas(jsonText) {
   // Allow JSON files that contain trailing commas (common in hand-edited config files).
   const sanitized = jsonText.replace(/,\s*([}\]])/g, "$1")
   return JSON.parse(sanitized)
}

function updateAppJson(versionName) {
   const appJsonPath = "./app.json"
   const appJson = parseJsonWithTrailingCommas(fs.readFileSync(appJsonPath, "utf8"))

   appJson.version = versionName

   fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2), "utf8")
   console.debug("Updated app.json")
}

function updateBuildGradle(versionName, versionCode) {
   const buildGradlePath = "./android/app/build.gradle"
   let buildGradle = fs.readFileSync(buildGradlePath, "utf8")

   buildGradle = buildGradle.replace(/versionCode \d+/g, `versionCode ${versionCode}`)
   buildGradle = buildGradle.replace(/versionName ".*"/g, `versionName "${versionName}"`)

   fs.writeFileSync(buildGradlePath, buildGradle, "utf8")
   console.debug("Updated build.gradle")
}

const versionName = "0.0.1"
const versionCode = 1

updateAppJson(versionName)
updateBuildGradle(versionName, versionCode)
