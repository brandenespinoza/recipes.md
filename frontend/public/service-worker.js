self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const SHARE_TARGET_PATH = "/share-target";

async function handleShareTarget(request) {
  let url = "";
  let title = "";
  let text = "";

  try {
    const formData = await request.formData();
    url = (formData.get("url") || "").toString();
    title = (formData.get("title") || "").toString();
    text = (formData.get("text") || "").toString();
  } catch (error) {
    console.warn("Unable to read share target payload:", error);
  }

  const params = new URLSearchParams();
  if (url) params.set("url", url);
  if (title) params.set("title", title);
  if (text) params.set("text", text);

  const redirectUrl = params.toString() ? `/add?${params.toString()}` : "/add";
  return Response.redirect(redirectUrl, 303);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method === "POST") {
    const url = new URL(request.url);
    if (url.pathname === SHARE_TARGET_PATH) {
      event.respondWith(handleShareTarget(request));
      return;
    }
  }
});
