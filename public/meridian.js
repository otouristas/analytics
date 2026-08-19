(function () {
  var script = document.currentScript;
  if (!script) return;
  var key = script.getAttribute("data-meridian-id") || script.getAttribute("data-key") || "";
  var origin = (script.getAttribute("data-host") || script.src).replace(/\/(?:t|meridian)\.js(?:\?.*)?$/, "");
  var site = location.host;
  var cookieless = script.getAttribute("data-cookieless") === "1";
  var sessionKey = "meridian.sid";
  var sid = null;
  var allowed = true;
  try {
    if (cookieless) {
      sid = sessionStorage.getItem(sessionKey);
      if (!sid) {
        sid = "c" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem(sessionKey, sid);
      }
    } else {
      sid = localStorage.getItem(sessionKey);
      if (!sid) {
        sid = "s" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(sessionKey, sid);
      }
    }
  } catch (e) {
    sid = "s" + Math.random().toString(36).slice(2);
  }
  var lastPath = location.pathname + location.search;
  var seenScroll = {};
  var seenVital = {};

  function guessSource() {
    try {
      var params = new URLSearchParams(location.search);
      var utm = (params.get("utm_source") || "").toLowerCase();
      if (params.get("gclid")) return "gads";
      if (params.get("fbclid")) return "facebook";
      if (utm) return utm;
      var ref = document.referrer || "";
      if (/grok|x\.ai/i.test(ref)) return "grok";
      if (/chatgpt|openai|chat\.openai/i.test(ref)) return "chatgpt";
      if (/perplexity/i.test(ref)) return "perplexity";
      if (/claude|anthropic/i.test(ref)) return "claude";
      if (/gemini|bard/i.test(ref)) return "gemini";
      if (/(^|\.)x\.com|twitter\.com/i.test(ref)) return "x";
      if (/yahoo\./i.test(ref)) return "yahoo";
      if (/facebook\.com|fb\.com/i.test(ref)) return "facebook";
      if (/instagram/i.test(ref)) return "instagram";
      if (/youtube/i.test(ref)) return "youtube";
      if (/reddit/i.test(ref)) return "reddit";
      if (/linkedin/i.test(ref)) return "linkedin";
      if (/google\./i.test(ref)) return "google";
      if (/bing\./i.test(ref)) return "bing";
      if (!ref) return "direct";
      return "referral";
    } catch (e) {
      return "direct";
    }
  }

  function ua() {
    var a = navigator.userAgent;
    var mobile = /Mobi|Android|iPhone|iPad/i.test(a);
    var os = /Mac OS X/.test(a) ? "macOS" : /Windows/.test(a) ? "Windows" : /Android/.test(a) ? "Android" : /iPhone|iPad/.test(a) ? "iOS" : "Other";
    var browser = /Edg\//.test(a) ? "Edge" : /Chrome\//.test(a) ? "Chrome" : /Safari\//.test(a) ? "Safari" : /Firefox\//.test(a) ? "Firefox" : "Other";
    return { mobile: mobile, os: os, browser: browser };
  }

  function send(extra) {
    if (!allowed) return;
    extra = extra || {};
    var info = ua();
    var params = new URLSearchParams(location.search);
    var payload = {
      writeKey: key,
      sessionId: sid,
      kind: extra.kind || "pageview",
      host: site,
      path: extra.path || location.pathname,
      title: extra.title || document.title,
      fromPath: extra.fromPath || "",
      href: extra.href || "",
      label: extra.label || "",
      source: extra.source || guessSource(),
      campaign: extra.campaign || params.get("utm_campaign") || "",
      medium: extra.medium || params.get("utm_medium") || "",
      referrer: document.referrer || "",
      query:
        extra.query ||
        params.get("q") ||
        params.get("utm_term") ||
        "",
      device: info.mobile ? "mobile" : "desktop",
      os: info.os,
      browser: info.browser,
    };
    var body = JSON.stringify(payload);
    var url = origin + "/api/collect";
    try {
      if (navigator.sendBeacon) {
        var blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(url, blob)) return;
      }
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
        keepalive: true,
        mode: "cors",
      });
    } catch (e) {}
  }

  function pageview(fromPath) {
    var next = location.pathname + location.search;
    if (next === lastPath && fromPath) return;
    lastPath = next;
    send({ kind: "pageview", fromPath: fromPath || "", path: location.pathname, title: document.title });
  }

  document.addEventListener(
    "click",
    function (event) {
      var node = event.target;
      while (node && node.tagName !== "A" && node.tagName !== "BUTTON") node = node.parentElement;
      if (!node) return;
      if (node.tagName === "A" && node.href) {
        var url;
        try {
          url = new URL(node.href, location.href);
        } catch (e) {
          return;
        }
        var label = (node.innerText || node.getAttribute("aria-label") || url.pathname).trim().slice(0, 80);
        var outbound = url.host && url.host !== location.host;
        var file = /\.(pdf|zip|csv|xlsx|docx)(\?|$)/i.test(url.pathname);
        send({
          kind: file ? "download" : outbound ? "outbound" : "click",
          href: url.href,
          label: label,
          path: location.pathname,
          title: document.title,
        });
      }
    },
    true,
  );

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || !form.tagName) return;
      send({
        kind: "form",
        label: (form.getAttribute("name") || form.getAttribute("id") || "form") + ":submit",
        path: location.pathname,
      });
    },
    true,
  );

  window.addEventListener(
    "scroll",
    function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) return;
      var pct = Math.round((doc.scrollTop / max) * 100);
      var marks = [25, 50, 75, 100];
      for (var i = 0; i < marks.length; i += 1) {
        var mark = marks[i];
        if (pct >= mark && !seenScroll[mark]) {
          seenScroll[mark] = true;
          send({ kind: "scroll", label: String(mark), path: location.pathname });
        }
      }
    },
    { passive: true },
  );

  try {
    if (typeof PerformanceObserver !== "undefined") {
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          var name = "";
          var value = 0;
          if (entry.entryType === "largest-contentful-paint") {
            name = "LCP";
            value = Math.round(entry.startTime);
          } else if (entry.entryType === "first-input") {
            name = "INP";
            value = Math.round(entry.processingStart - entry.startTime);
          } else if (entry.entryType === "layout-shift" && !entry.hadRecentInput) {
            name = "CLS";
            value = Math.round(entry.value * 1000);
          }
          if (!name || seenVital[name]) return;
          seenVital[name] = true;
          send({ kind: "vital", label: name, query: String(value), path: location.pathname });
        });
      });
      try {
        po.observe({ type: "largest-contentful-paint", buffered: true });
      } catch (e) {}
      try {
        po.observe({ type: "first-input", buffered: true });
      } catch (e) {}
      try {
        po.observe({ type: "layout-shift", buffered: true });
      } catch (e) {}
    }
  } catch (e) {}

  window.addEventListener("pagehide", function () {
    send({ kind: "exit", path: location.pathname, title: document.title });
  });

  var push = history.pushState;
  history.pushState = function () {
    var from = lastPath;
    push.apply(this, arguments);
    pageview(from);
  };
  var replace = history.replaceState;
  history.replaceState = function () {
    var from = lastPath;
    replace.apply(this, arguments);
    pageview(from);
  };
  window.addEventListener("popstate", function () {
    pageview(lastPath);
  });

  setInterval(function () {
    if (document.visibilityState === "visible") send({ kind: "heartbeat", path: location.pathname });
  }, 15000);

  window.meridian = {
    track: function (name, props) {
      if (name && typeof name === "object") return send(name);
      send({
        kind: name === "page_view" || name === "pageview" ? "pageview" : "custom",
        label: name || "",
        path: (props && props.path) || location.pathname,
        title: (props && props.title) || document.title,
        href: (props && String(props.href)) || "",
        query: (props && (props.query || props.term)) || "",
      });
    },
    page: pageview,
    identify: function () {},
    consent: function (flags) {
      allowed = !flags || flags.analytics !== false;
    },
    revenue: function (info) {
      info = info || {};
      send({ kind: "custom", label: "purchase", title: String(info.transactionId || "purchase"), query: String(info.amount || "") });
    },
  };
  pageview("");
})();
