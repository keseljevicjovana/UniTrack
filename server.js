require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

const authRoutes = require("./routes/auth");
const resetRoutes = require("./routes/reset");
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const firmaRoutes = require("./routes/firma");
const sluzbaRoutes = require("./routes/sluzba");

const jeProizvodnja = process.env.NODE_ENV === "production";

// ─── CORS — dozvoljava lokalni frontend (dev) I deployovani frontend (prod) ──
const dozvoljeniOrigini = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // npr. https://unitrack.vercel.app — podesava se na Render-u
].filter(Boolean);

app.use(
  cors({
    origin: dozvoljeniOrigini,
    credentials: true,
  })
);

app.use(express.json());

// Render/Railway/itd. stoje iza reverse proxy-a — ovo je potrebno da
// "secure" kolačić ispravno radi kad je sajt iza HTTPS proxy-a
app.set("trust proxy", 1);

// ─── Sesije se čuvaju u bazi (ne u memoriji servera) — bez ovoga bi se svi
// korisnici "izlogovali" svaki put kad Render besplatni plan uspava server ──
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  ssl: process.env.DB_SSL === "true"
    ? { minVersion: "TLSv1.2", rejectUnauthorized: true }
    : undefined,
});

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "tajna_sifra",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // U produkciji MORA biti secure+none (frontend i backend su na
      // razlicitim domenima). Lokalno ostaje kako je bilo (lax, ne secure).
      secure: jeProizvodnja,
      sameSite: jeProizvodnja ? "none" : "lax",
    },
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/reset", resetRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/firma", firmaRoutes);
app.use("/api/sluzba", sluzbaRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend" });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});