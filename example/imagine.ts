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

  const raw = fs.readFileSync(FILE_PATH, "utf-8");
  console.log("🔍 Raw file content:");
  console.log(raw.slice(0, 500)); // affiche les 500 premiers caractères
  const data: { title: string; urls: string[] }[] = JSON.parse(raw);
  console.log("Loaded data:", data);

  // Créer le client Midjourney
  const client = new Midjourney({
    ServerId: process.env.SERVER_ID!,
    ChannelId: process.env.CHANNEL_ID!,
    SalaiToken: process.env.SALAI_TOKEN!,
    Debug: true,
    Limit: 120,
    Ws: false,
  });
  console.log("SALAI_TOKEN:", process.env.SALAI_TOKEN?.slice(0,5));
  console.log("SERVER_ID:", process.env.SERVER_ID?.slice(-5));
  console.log("CHANNEL_ID:", process.env.CHANNEL_ID?.slice(-5));

  // Boucle sur chaque titre pour générer l'image
  for (const item of data) {
    console.log(`🎨 Generating image for: ${item.title}`);
    try {
      const msg = await client.Imagine(item.title, (uri: string, progress: string) => {
        console.log("loading", uri, "progress", progress);
      });
  
      // Récupérer le hash ou l'identifiant de l'image
      const hash = msg[0]?.hash || msg?.hash;
      const msgId = msg[0]?.id || msg?.id;
      const msgFlags = msg[0]?.flags || msg?.flags;
      const msgContent = msg[0]?.content || msg?.content;

      if (hash) {
        item.urls.push(
          ...[0, 1, 2, 3].map(i => `https://cdn.midjourney.com/${hash}/0_${i}.webp`)
        );
        console.log(`✅ Image generated for "${item.title}": ${item.urls}`);
  
        const msg2 = await client.Upscale({
          index: 2,
          msgId,
          hash,
          flags: msgFlags,
          content: msgContent,
          loading: (uri: string, progress: string) => {
            console.log("loading image Pinterest", uri, "progress", progress);
          },
        });
  
        console.log("message 2 : ", msg2);
  
        // 🔹 Construire l’URL Pinterest
        if (msg2?.proxy_url) {
          const pinterestUrl = `${msg2.proxy_url}&format=jpeg&quality=lossless&width=1000&height=1500`;
  
          // Ajouter au JSON
          (item as any).pinterestImage = pinterestUrl;
  
          console.log(`📌 Pinterest image added for "${item.title}": ${pinterestUrl}`);
        } else {
          console.warn(`⚠️ No proxy_url found for "${item.title}"`);
        }

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
