import "dotenv/config";
import { Midjourney } from "../src";
import fs from "fs";
import path from "path";

const FILE_PATH = path.join(__dirname, "../../scripts/titles.json");

async function main() {
  // Vérifier que le JSON existe
  console.log("Looking for file at:", FILE_PATH);
  if (!fs.existsSync(FILE_PATH)) {
    console.error("❌ File not found!");
    process.exit(1);
  }

  // Charger le JSON
  const data: { title: string; urls: string[] }[] = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));
  console.log("Loaded data:", data);

  // Créer le client Midjourney
  const client = new Midjourney({
    ServerId: process.env.SERVER_ID!,
    ChannelId: process.env.CHANNEL_ID!,
    SalaiToken: process.env.SALAI_TOKEN!,
    Debug: true,
    Ws: false,
  });

  // Boucle sur chaque titre pour générer l'image
  for (const item of data) {
    console.log(`🎨 Generating image for: ${item.title}`);
    try {
      const msg = await client.Imagine(item.title, (uri: string, progress: string) => {
        console.log("loading", uri, "progress", progress);
      });
  
      // Récupérer le hash ou l'identifiant de l'image
      const hash = msg[0]?.hash || msg?.hash;
      if (hash) {
        const imageUrl = `https://cdn.midjourney.com/${hash}/0_0.png`;
        item.urls.push(imageUrl);
        console.log(`✅ Image generated for "${item.title}": ${imageUrl}`);
  
        // Sauvegarder immédiatement le JSON après cette image
        fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
        console.log(`💾 JSON updated after "${item.title}"`);
      } else {
        console.warn(`⚠️ No hash returned for "${item.title}"`);
      }
    } catch (err) {
      console.error("❌ Error generating image for", item.title, err);
    }
  }
}

// Lancer le script
main().catch((err) => {
  console.error(err);
  process.exit(1);
});


/***
 *
 * a simple example of how to use the imagine command
 * ```
 * npx tsx example/imagine.ts
 * ```
 
async function main() {
  const client = new Midjourney({
    ServerId: <string>process.env.SERVER_ID,
    ChannelId: <string>process.env.CHANNEL_ID,
    SalaiToken: <string>process.env.SALAI_TOKEN,
    Debug: true,
    Ws: false,
  });

  const msg = await client.Imagine(
    "chicken recipe",
    (uri: string, progress: string) => {
      console.log("loading", uri, "progress", progress);
    }
  );
  console.log("finish");
  console.log(JSON.stringify(msg));
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});*/
