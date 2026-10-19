const fs = require("node:fs");
const path = require("node:path");

const source = process.env.GOOGLE_SERVICES_JSON;
if (!source) {
  process.exit(0);
}

const destination = path.join(process.cwd(), "google-services.json");
if (path.resolve(source) === path.resolve(destination)) {
  process.exit(0);
}

fs.copyFileSync(source, destination);
