import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src");

function movePath(fromRel, toRel) {
  const from = path.join(root, fromRel);
  const to = path.join(root, toRel);
  if (!fs.existsSync(from)) {
    console.warn("skip missing:", fromRel);
    return;
  }

  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const name of fs.readdirSync(from)) {
      movePath(path.join(fromRel, name), path.join(toRel, name));
    }
    try {
      fs.rmdirSync(from);
    } catch {}
  } else {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    if (fs.existsSync(to)) {
      console.warn("exists, skip:", toRel);
      return;
    }
    fs.renameSync(from, to);
    console.log("moved", fromRel, "->", toRel);
  }
}

const moves = [
  ["pages/content", "features/browse/pages"],
  ["pages/player", "features/playback/pages"],
  ["pages/subscription", "features/subscription/pages"],
  ["pages/user/FavoritesPage.tsx", "features/watchlist/pages/FavoritesPage.tsx"],
  ["pages/user/ProfilePage.tsx", "features/account/pages/ProfilePage.tsx"],
  ["components/home", "features/browse/components/home"],
  ["components/category", "features/browse/components/category"],
  ["components/tv", "features/browse/components/tv"],
  ["components/player", "features/playback/components"],
  ["components/search", "features/search/components"],
  ["components/subscription", "features/subscription/components"],
  ["components/user", "features/account/components"],
  ["components/layout", "shared/layout"],
  ["components/common", "shared/ui"],
  ["routes", "app/routes"],
  ["stores/StoreBootstrap.tsx", "app/providers/StoreBootstrap.tsx"],
  ["stores/initStores.ts", "app/providers/initStores.ts"],
  ["services/firebase.ts", "core/firebase/index.ts"],
  ["services/tmdb.ts", "core/api/tmdb/index.ts"],
  ["services/recommendation.ts", "features/engagement/services/recommendation.ts"],
  ["services/recommendation.test.ts", "features/engagement/services/recommendation.test.ts"],
  ["hooks", "shared/hooks"],
  ["utils", "shared/lib"],
  ["constants", "shared/constants"],
  ["types", "shared/types"],
  ["App.tsx", "app/App.tsx"],
];

for (const [fromRel, toRel] of moves) {
  movePath(fromRel, toRel);
}

const replacements = [
  [/@\/pages\/auth\//g, "@/features/auth/pages/"],
  [/@\/pages\/content\//g, "@/features/browse/pages/"],
  [/@\/pages\/player\//g, "@/features/playback/pages/"],
  [/@\/pages\/subscription\//g, "@/features/subscription/pages/"],
  [/@\/pages\/user\/FavoritesPage/g, "@/features/watchlist/pages/FavoritesPage"],
  [/@\/pages\/user\/ProfilePage/g, "@/features/account/pages/ProfilePage"],
  [/@\/components\/home\//g, "@/features/browse/components/home/"],
  [/@\/components\/category\//g, "@/features/browse/components/category/"],
  [/@\/components\/tv\//g, "@/features/browse/components/tv/"],
  [/@\/components\/player\//g, "@/features/playback/components/"],
  [/@\/components\/search\//g, "@/features/search/components/"],
  [/@\/components\/subscription\//g, "@/features/subscription/components/"],
  [/@\/components\/user\//g, "@/features/account/components/"],
  [/@\/components\/layout\//g, "@/shared/layout/"],
  [/@\/components\/common\//g, "@/shared/ui/"],
  [/@\/routes\//g, "@/app/routes/"],
  [/@\/stores\/StoreBootstrap/g, "@/app/providers/StoreBootstrap"],
  [/@\/stores\/initStores/g, "@/app/providers/initStores"],
  [/@\/services\/firebase/g, "@/core/firebase"],
  [/@\/services\/tmdb/g, "@/core/api/tmdb"],
  [/@\/services\/recommendation/g, "@/features/engagement/services/recommendation"],
  [/@\/hooks\//g, "@/shared/hooks/"],
  [/@\/utils\//g, "@/shared/lib/"],
  [/@\/constants\//g, "@/shared/constants/"],
  [/@\/types\//g, "@/shared/types/"],
  [/from "\.\/App"/g, 'from "@/app/App"'],
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walk(full, files);
    } else if (/\.(tsx?|css|json|mjs)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  let next = content;
  for (const [pattern, replacement] of replacements) {
    next = next.replace(pattern, replacement);
  }
  if (next !== content) fs.writeFileSync(file, next, "utf8");
}

["pages", "components", "routes", "hooks", "utils", "constants", "types"].forEach((d) => {
  const p = path.join(root, d);
  if (fs.existsSync(p)) {
    try {
      fs.rmSync(p, { recursive: true, force: true });
    } catch {}
  }
});

console.log("done");
