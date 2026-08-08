/**
 * Agent Sync server for Agentation.
 *
 * The toolbar's `endpoint` prop drives these routes (read off the shipped
 * bundle in node_modules/agentation/dist/index.mjs):
 *
 *   GET    /health                        -> 200 marks the toolbar "connected"
 *   POST   /sessions            {url}     -> { id, url, annotations: [] }
 *   GET    /sessions/:id                  -> { id, url, annotations: [...] }
 *   POST   /sessions/:id/annotations      -> the stored annotation
 *   PATCH  /annotations/:id               -> the updated annotation
 *   DELETE /annotations/:id               -> { ok: true }
 *   GET    /sessions/:id/events           -> SSE stream
 *
 * Everything lands in .agentation/ — annotations.json is the source of truth,
 * annotations.md is a readable mirror so an agent can just open the file.
 */
import { createServer } from "node:http";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const PORT = Number(process.env.AGENTATION_PORT ?? 4747);
const OUT_DIR = join(process.cwd(), ".agentation");
const JSON_PATH = join(OUT_DIR, "annotations.json");
const MD_PATH = join(OUT_DIR, "annotations.md");

mkdirSync(OUT_DIR, { recursive: true });

/** @type {{ sessions: Record<string, {id: string, url: string, createdAt: string, annotations: any[]}> }} */
let db = { sessions: {} };
if (existsSync(JSON_PATH)) {
  try {
    db = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  } catch {
    console.warn("[agentation] annotations.json unreadable — starting fresh");
  }
}

// SSE listeners, keyed by session id.
const listeners = new Map();

let seq = 0;
const newId = (prefix) =>
  `${prefix}_${Date.now().toString(36)}_${(seq++).toString(36)}`;

function allAnnotations() {
  return Object.values(db.sessions).flatMap((s) =>
    s.annotations.map((a) => ({ ...a, sessionId: s.id, sessionUrl: s.url })),
  );
}

function renderMarkdown() {
  const rows = allAnnotations().sort(
    (a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0),
  );
  const lines = [
    "# Agentation annotations",
    "",
    `${rows.length} annotation${rows.length === 1 ? "" : "s"}.`,
    "",
  ];

  for (const a of rows) {
    lines.push(`## ${a.element ?? "element"} — ${a.kind ?? "feedback"}`);
    lines.push("");
    lines.push(`> ${a.comment || "(no comment)"}`);
    lines.push("");
    const field = (label, value) =>
      value ? lines.push(`- **${label}:** ${value}`) : undefined;
    field("Page", a.sessionUrl);
    field("Selector", a.elementPath);
    field("Full path", a.fullPath);
    field("Classes", a.cssClasses);
    field("React", a.reactComponents);
    field("Source", a.sourceFile);
    field("Selected text", a.selectedText);
    field("Nearby text", a.nearbyText);
    if (a.boundingBox) {
      const b = a.boundingBox;
      field(
        "Box",
        `x ${Math.round(b.x)}, y ${Math.round(b.y)}, ${Math.round(b.width)}×${Math.round(b.height)}`,
      );
    }
    field("Status", a.status);
    field("Id", a.id);
    lines.push("");
  }

  return lines.join("\n");
}

function persist() {
  writeFileSync(JSON_PATH, JSON.stringify(db, null, 2));
  writeFileSync(MD_PATH, renderMarkdown());
}

function broadcast(sessionId, event) {
  const subs = listeners.get(sessionId);
  if (!subs) return;
  const frame = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of subs) res.write(frame);
}

function findAnnotation(annotationId) {
  for (const session of Object.values(db.sessions)) {
    const index = session.annotations.findIndex((a) => a.id === annotationId);
    if (index !== -1) return { session, index };
  }
  return null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function send(res, status, body) {
  res.writeHead(status, { ...CORS, "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
  const parts = pathname.split("/").filter(Boolean);

  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  try {
    if (req.method === "GET" && pathname === "/health") {
      return send(res, 200, { ok: true, annotations: allAnnotations().length });
    }

    // GET /sessions/:id/events — SSE
    if (
      req.method === "GET" &&
      parts[0] === "sessions" &&
      parts[2] === "events"
    ) {
      const sessionId = parts[1];
      res.writeHead(200, {
        ...CORS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": connected\n\n");
      const subs = listeners.get(sessionId) ?? new Set();
      subs.add(res);
      listeners.set(sessionId, subs);
      const keepAlive = setInterval(() => res.write(": ping\n\n"), 15000);
      req.on("close", () => {
        clearInterval(keepAlive);
        subs.delete(res);
      });
      return;
    }

    if (req.method === "POST" && pathname === "/sessions") {
      const body = await readBody(req);
      const session = {
        id: newId("sess"),
        url: body.url ?? "",
        createdAt: new Date().toISOString(),
        annotations: [],
      };
      db.sessions[session.id] = session;
      persist();
      console.log(`[agentation] session ${session.id} — ${session.url}`);
      return send(res, 201, session);
    }

    if (req.method === "GET" && parts[0] === "sessions" && parts.length === 2) {
      const session = db.sessions[parts[1]];
      if (!session) return send(res, 404, { error: "no such session" });
      return send(res, 200, session);
    }

    if (
      req.method === "POST" &&
      parts[0] === "sessions" &&
      parts[2] === "annotations"
    ) {
      const session = db.sessions[parts[1]];
      if (!session) return send(res, 404, { error: "no such session" });
      const body = await readBody(req);
      const annotation = {
        ...body,
        id: body.id ?? newId("ann"),
        sessionId: session.id,
        receivedAt: new Date().toISOString(),
      };
      session.annotations.push(annotation);
      persist();
      console.log(
        `[agentation] + ${annotation.element ?? "element"}: ${annotation.comment ?? ""}`,
      );
      broadcast(session.id, { type: "annotation.created", payload: annotation });
      return send(res, 201, annotation);
    }

    if (
      req.method === "PATCH" &&
      parts[0] === "annotations" &&
      parts.length === 2
    ) {
      const hit = findAnnotation(parts[1]);
      if (!hit) return send(res, 404, { error: "no such annotation" });
      const body = await readBody(req);
      const updated = { ...hit.session.annotations[hit.index], ...body };
      hit.session.annotations[hit.index] = updated;
      persist();
      broadcast(hit.session.id, {
        type: "annotation.updated",
        payload: updated,
      });
      return send(res, 200, updated);
    }

    if (
      req.method === "DELETE" &&
      parts[0] === "annotations" &&
      parts.length === 2
    ) {
      const hit = findAnnotation(parts[1]);
      if (!hit) return send(res, 404, { error: "no such annotation" });
      const [removed] = hit.session.annotations.splice(hit.index, 1);
      persist();
      broadcast(hit.session.id, {
        type: "annotation.deleted",
        payload: removed,
      });
      return send(res, 200, { ok: true });
    }

    return send(res, 404, { error: `no route for ${req.method} ${pathname}` });
  } catch (err) {
    console.error("[agentation]", err);
    return send(res, 500, { error: String(err) });
  }
});

server.listen(PORT, () => {
  console.log(`[agentation] Agent Sync listening on http://localhost:${PORT}`);
  console.log(`[agentation] writing ${JSON_PATH}`);
  console.log(`[agentation] writing ${MD_PATH}`);
});
