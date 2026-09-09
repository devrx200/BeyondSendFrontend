import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const BUILD_TIMESTAMP = new Date().toISOString();

import https from "node:https";
import zlib from "node:zlib";

function cgCalendarProxyPlugin() {
  const cookieJar = new Map();

  const getCookieHeader = () => {
    if (cookieJar.size === 0) return "";
    return Array.from(cookieJar.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  };

  const updateCookies = (setCookieHeader) => {
    if (!setCookieHeader) return;
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    for (const c of cookies) {
      if (typeof c !== "string") continue;
      const [nameVal] = c.split(";");
      const eqIdx = nameVal.indexOf("=");
      if (eqIdx > 0) {
        const k = nameVal.substring(0, eqIdx).trim();
        const v = nameVal.substring(eqIdx + 1).trim();
        cookieJar.set(k, v);
      }
    }
  };

  return {
    name: "cg-calendar-proxy",
    transformIndexHtml() {
      return [
        {
          tag: "script",
          children: "var __SERVER_FORWARD_CONSOLE__ = false; window.__SERVER_FORWARD_CONSOLE__ = false;",
          injectTo: "head-prepend",
        },
      ];
    },
    transform(code) {
      if (typeof code === "string" && code.includes("__SERVER_FORWARD_CONSOLE__")) {
        return code.replace(/__SERVER_FORWARD_CONSOLE__/g, "false");
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes("/@vite/client")) {
          const _write = res.write;
          const _end = res.end;
          const chunks = [];
          res.write = function (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            return true;
          };
          res.end = function (chunk) {
            if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            let body = Buffer.concat(chunks).toString("utf8");
            body = "var __SERVER_FORWARD_CONSOLE__ = false;\n" + body.replace(/__SERVER_FORWARD_CONSOLE__/g, "false");
            res.setHeader("content-length", Buffer.byteLength(body));
            _end.call(res, body);
          };
        }
        next();
      });
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        if (
          url.startsWith("/cg-calendar-frame") ||
          url.startsWith("/user-assets") ||
          url.startsWith("/calendar-holidays") ||
          url.startsWith("/download-calendar")
        ) {
          let targetPath = url;
          if (targetPath.startsWith("/cg-calendar-frame")) {
            targetPath = targetPath.replace(/^\/cg-calendar-frame/, "") || "/hi/calendar";
          }
          const targetUrl = new URL(targetPath, "https://cgstate.gov.in");

          const proxyHeaders = {
            host: "cgstate.gov.in",
            referer: `https://cgstate.gov.in${targetPath.startsWith("/") ? targetPath : "/" + targetPath}`,
            origin: "https://cgstate.gov.in",
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            accept: req.headers["accept"] || "*/*",
            "accept-language": req.headers["accept-language"] || "hi,en-US;q=0.9,en;q=0.8",
            "accept-encoding": "gzip, deflate, br",
          };

          if (req.headers["content-type"]) {
            proxyHeaders["content-type"] = req.headers["content-type"];
          }
          if (req.headers["content-length"]) {
            proxyHeaders["content-length"] = req.headers["content-length"];
          }

          const currentCookies = getCookieHeader();
          if (currentCookies) {
            proxyHeaders["cookie"] = currentCookies;
          }

          const proxyReq = https.request(
            targetUrl,
            {
              method: req.method,
              rejectUnauthorized: false,
              insecureHTTPParser: true,
              headers: proxyHeaders,
            },
            (proxyRes) => {
              // Update cookies cleanly in jar
              if (proxyRes.headers["set-cookie"]) {
                updateCookies(proxyRes.headers["set-cookie"]);
              }

              const headers = { ...proxyRes.headers };
              delete headers["content-security-policy"];
              delete headers["x-frame-options"];
              delete headers["content-security-policy-report-only"];
              headers["access-control-allow-origin"] = "*";
              headers["access-control-allow-methods"] = "GET, POST, OPTIONS";
              headers["access-control-allow-headers"] = "*";

              const contentType = proxyRes.headers["content-type"] || "";
              const isHtml = contentType.includes("text/html");

              if (isHtml) {
                // Buffer HTML to rewrite hardcoded absolute https://cgstate.gov.in URLs and inject main-content CSS
                delete headers["content-length"];
                delete headers["content-encoding"];

                const chunks = [];
                const enc = proxyRes.headers["content-encoding"];
                const stream =
                  enc === "gzip"
                    ? proxyRes.pipe(zlib.createGunzip())
                    : enc === "deflate"
                      ? proxyRes.pipe(zlib.createInflate())
                      : enc === "br"
                        ? proxyRes.pipe(zlib.createBrotliDecompress())
                        : proxyRes;

                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("end", () => {
                  let html = Buffer.concat(chunks).toString("utf-8");

                  // Rewrite hardcoded cgstate URLs in HTML/JS to use local proxy
                  html = html.replace(/https:\/\/cgstate\.gov\.in\/calendar-holidays/g, "/calendar-holidays");
                  html = html.replace(/https:\/\/cgstate\.gov\.in\/user-assets\//g, "/user-assets/");
                  html = html.replace(/https:\/\/cgstate\.gov\.in\/download-calendar/g, "/download-calendar");
                  html = html.replace(/https:\/\/cgstate\.gov\.in\/hi\/calendar/g, "/cg-calendar-frame/hi/calendar");
                  html = html.replace(/https:\/\/cgstate\.gov\.in\/en\/calendar/g, "/cg-calendar-frame/en/calendar");

                  // Strip Bhashini auto-translation utility so Hindi stays 100% pure Hindi and English stays 100% pure English
                  html = html.replace(/<script[^>]*website_translation[^>]*>[\s\S]*?<\/script>/gi, "");
                  html = html.replace(/<script[^>]*bhashini[^>]*>[\s\S]*?<\/script>/gi, "");

                  // Inject isolate ONLY #main-content styling and script
                  const injection = `
                    <style id="cg-embed-style">
                      html, body {
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow-x: hidden !important;
                      }
                      body > *:not(#main-content) {
                        display: none !important;
                      }
                      header, footer, nav, .header, .footer, .site-header, .site-footer,
                      .top-header, .navbar, .breadcrumb, .top-bar, .marquee, .sub-header,
                      #header, #footer, .skip-to-content, #top-header, .bg-header, .portal-header,
                      .quick-links, .social-links-header, .bhashini-widget, .footer-section,
                      .gov-header, .global-header, .global-footer, .cg-chatbot, .uw-widget-custom-trigger,
                      .rbt-progress-parent, a.close_side_menu {
                        display: none !important;
                      }
                      #main-content {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        padding: 0 !important;
                        margin: 0 auto !important;
                        max-width: 100% !important;
                        width: 100% !important;
                      }
                      .rbt-page-banner-wrapper {
                        display: block !important;
                        visibility: visible !important;
                        opacity: 1 !important;
                        padding: 20px 0 !important;
                        margin-bottom: 10px !important;
                      }
                      .page-list {
                        display: flex !important;
                        visibility: visible !important;
                      }
                      /* Hide Android and iOS app download buttons */
                      .download-btn,
                      .download-btn.android,
                      .download-btn.ios,
                      a[href*="play.google.com"],
                      a[href*="apps.apple.com"],
                      .download-btn-area {
                        display: none !important;
                      }
                      .rbt-counterup-area {
                        padding: 0 !important;
                      }
                      .container {
                        max-width: 100% !important;
                        width: 100% !important;
                        padding-left: 15px !important;
                        padding-right: 15px !important;
                      }
                    </style>
                    <script id="cg-jquery-fix">
                      (function() {
                        function patchJQuery() {
                          var jq = window.jQuery || window.$;
                          if (jq && jq.fn && !jq.fn.__loadShimmed) {
                            var _oldLoad = jq.fn.load;
                            jq.fn.load = function(url, params, callback) {
                              if (typeof url === "function" || (typeof url === "object" && url !== null)) {
                                return this.on("load", url);
                              }
                              if (typeof _oldLoad === "function") {
                                return _oldLoad.apply(this, arguments);
                              }
                              return this;
                            };
                            jq.fn.__loadShimmed = true;
                          }
                        }
                        patchJQuery();
                        var intv = setInterval(patchJQuery, 10);
                        window.addEventListener("DOMContentLoaded", function() {
                          patchJQuery();
                          setTimeout(function() { clearInterval(intv); }, 4000);
                        });
                      })();
                    </script>
                    <script id="cg-embed-isolate-js">
                      document.addEventListener("DOMContentLoaded", function() {
                        var main = document.getElementById("main-content");
                        if (main && document.body) {
                          Array.from(document.body.children).forEach(function(el) {
                            if (el !== main && el.tagName !== "SCRIPT" && el.tagName !== "STYLE") {
                              el.style.setProperty("display", "none", "important");
                            }
                          });
                          main.style.setProperty("display", "block", "important");
                        }
                      });
                    </script>
                  `;
                  html = html.replace(/<head[^>]*>/i, (match) => `${match}${injection}`);

                  res.writeHead(proxyRes.statusCode || 200, headers);
                  res.end(html);
                });

                stream.on("error", (err) => {
                  console.error("CG Proxy Stream Error:", err.message);
                  if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Stream Error: " + err.message);
                  }
                });
              } else {
                res.writeHead(proxyRes.statusCode || 200, headers);
                proxyRes.pipe(res);
              }
            }
          );

          proxyReq.on("error", (err) => {
            console.error("CG Proxy Error:", err.message);
            if (!res.headersSent) {
              res.writeHead(502, { "Content-Type": "text/plain" });
              res.end("Proxy Error: " + err.message);
            }
          });

          if (req.method === "POST" || req.method === "PUT") {
            req.pipe(proxyReq);
          } else {
            proxyReq.end();
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cgCalendarProxyPlugin()],
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(BUILD_TIMESTAMP),
    __SERVER_FORWARD_CONSOLE__: false,
  },
  base: "/",
  server: {
    host: true,
    port: 5175,
    strictPort: true,
    forwardConsole: false,
    hmr: {
      overlay: false,
    },
  },
  esbuild: {
    target: "es2020",
    legalComments: "none",
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
  build: {
    target: "es2020",
    emptyOutDir: false,
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-icons") || id.includes("lucide-react") || id.includes("bootstrap-icons")) {
              return "icons-vendor";
            }
            if (id.includes("react-quill") || id.includes("jodit-react") || id.includes("tinymce") || id.includes("ckeditor5")) {
              return "editor-vendor";
            }
            if (id.includes("reactstrap") || id.includes("bootstrap") || id.includes("sweetalert2") || id.includes("swiper")) {
              return "ui-vendor";
            }
            if (id.includes("react-pdf") || id.includes("pdfjs-dist") || id.includes("@smazeeapps/file-viewer")) {
              return "pdf-vendor";
            }
            if (id.includes("axios") || id.includes("jwt-decode")) {
              return "utils-vendor";
            }
          }
        },
      },
    },
  },
});