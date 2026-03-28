const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..", "app", "demo", "ai")

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p)
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) {
      let s = fs.readFileSync(p, "utf8")
      if (s.includes("/demo/ai/demo/ai")) continue
      s = s.split('"/dashboard').join('"/demo/ai/dashboard')
      s = s.split("'/dashboard").join("'/demo/ai/dashboard")
      s = s.split("`/dashboard").join("`/demo/ai/dashboard")
      s = s.split('"/admin').join('"/demo/ai/admin')
      s = s.split("'/admin").join("'/demo/ai/admin")
      s = s.split("`/admin").join("`/demo/ai/admin")
      s = s.split('"/auth').join('"/demo/ai/auth')
      s = s.split("'/auth").join("'/demo/ai/auth")
      s = s.split("`/auth").join("`/demo/ai/auth")
      // Sign out -> demo hub
      s = s.split('href="/"').join('href="/demo"')
      s = s.split("href='/'").join("href='/demo'")
      fs.writeFileSync(p, s)
      console.log("rewrote", path.relative(root, p))
    }
  }
}

if (fs.existsSync(root)) walk(root)
