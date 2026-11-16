// Download only recordings whose source explicitly identifies a native speaker.
// Keep the original audio bytes and source attribution; rerun deliberately to update.
import { mkdir, writeFile, readFile } from "node:fs/promises";
const candidates = {
  hallo: ["De-Hallo.ogg", "De-Hallo2.ogg"], danke: ["De-danke.ogg", "De-danke2.ogg"],
  bitte: ["De-bitte.ogg", "De-bitte2.ogg"], tschuss: ["De-tschüss.ogg", "De-tschüss2.ogg"],
  morgen: ["De-Guten Morgen.ogg"], mutter: ["De-Mutter2.ogg", "De-Mutter.ogg"],
  vater: ["De-Vater2.ogg", "De-Vater.ogg"], kind: ["De-Kind2.ogg", "De-Kind.ogg"],
  bruder: ["De-Bruder2.ogg", "De-Bruder.ogg"], schwester: ["De-Schwester2.ogg", "De-Schwester.ogg"],
  apfel: ["De-Apfel2.ogg"], brot: ["De-Brot2.ogg", "De-Brot.ogg"],
  wasser: ["De-Wasser2.ogg", "De-Wasser.ogg"], milch: ["De-Milch2.ogg", "De-Milch.ogg"],
  ei: ["De-Ei2.ogg", "De-Ei.ogg"], haus: ["De-Haus2.ogg", "De-Haus.ogg"],
  tisch: ["De-Tisch2.ogg", "De-Tisch.ogg"], stuhl: ["De-Stuhl2.ogg", "De-Stuhl.ogg"],
  tur: ["De-Tür2.ogg", "De-Tür.ogg"], fenster: ["De-Fenster2.ogg", "De-Fenster.ogg"],
  lernen: ["De-lernen2.ogg", "De-lernen.ogg"], lesen: ["De-lesen2.ogg", "De-lesen.ogg"],
  essen: ["De-essen2.ogg", "De-essen.ogg"], trinken: ["De-trinken2.ogg", "De-trinken.ogg"],
  schlafen: ["De-schlafen2.ogg", "De-schlafen.ogg"],
};
const titles = Object.values(candidates).flat().map(name => `File:${name}`).join("|");
const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
endpoint.search = new URLSearchParams({ action: "query", format: "json", prop: "imageinfo", iiprop: "url|extmetadata", titles });
const response = await fetch(endpoint);
if (!response.ok) throw new Error(`Metadata HTTP ${response.status}`);
const pages = Object.values((await response.json()).query.pages);
await mkdir("public/audio", { recursive: true });
const manifest = {};
for (const [id, names] of Object.entries(candidates)) {
  for (const name of names) {
    const info = pages.find(page => page.title === `File:${name}`)?.imageinfo?.[0];
    const meta = info?.extmetadata;
    const description = meta?.ImageDescription?.value ?? "";
    if (!/native German speaker|deutsch\w* Muttersprachler/i.test(description)) continue;
    if (!/^CC BY(-SA)? [34]\.0$/.test(meta.LicenseShortName?.value ?? "")) continue;
    let bytes;
    try { bytes = await readFile(`public/audio/${id}.ogg`); }
    catch {
      const download = await fetch(info.url);
      if (!download.ok) { console.warn(`Skipped ${id}: HTTP ${download.status}`); break; }
      bytes = Buffer.from(await download.arrayBuffer());
    }
    if (bytes.subarray(0, 4).toString() !== "OggS") throw new Error(`Not Ogg: ${name}`);
    await writeFile(`public/audio/${id}.ogg`, bytes);
    manifest[id] = { src: `/audio/${id}.ogg`, author: meta.Artist.value.replace(/<[^>]*>/g, ""), source: info.descriptionurl, license: meta.LicenseShortName.value, licenseUrl: meta.LicenseUrl.value, speaker: "Người Đức bản xứ (theo mô tả nguồn)", description, originalUrl: info.url, modified: false };
    console.log(`${id}: ${manifest[id].author}, ${manifest[id].license}`);
    break;
  }
}
await writeFile("lib/audio-manifest.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`${Object.keys(manifest).length} native recordings imported.`);
