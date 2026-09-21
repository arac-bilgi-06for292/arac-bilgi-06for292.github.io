import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const APP_SOURCE = "https://ncoicjbyllvjwusayqzm.supabase.co/functions/v1/hc-randevu";

async function getAppHtml() {
  const r = await fetch(APP_SOURCE, { headers: { "cache-control": "no-cache" } });
  if (!r.ok) throw new Error(`Upstream HTTP ${r.status}`);
  const html = await r.text();
  if (!html.toLowerCase().includes("<!doctype html") && !html.toLowerCase().includes("<html")) {
    throw new Error("HC uygulama kaynağı geçersiz HTML döndürdü.");
  }
  return html;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname === "/health") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      res.end(JSON.stringify({ ok: true, service: "HC Randevu Takip" }));
      return;
    }

    const html = await getAppHtml();
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin"
    });
    res.end(html);
  } catch (err) {
    res.writeHead(502, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    res.end(`<!doctype html><meta charset="utf-8"><title>HC Randevu Takip</title><body style="font-family:system-ui;padding:40px"><h1>HC Randevu Takip</h1><p>Uygulama kaynağına ulaşılamadı. Lütfen birkaç saniye sonra tekrar deneyin.</p></body>`);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HC Randevu Takip listening on ${PORT}`);
});
