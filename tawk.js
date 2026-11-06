// tawk.to chat widget. Mintlify loads every root .js file on every page.
// Links ending in "#create-ticket" open the widget. Until the widget loads
// (missing ID, ad blocker, slow network) they fall back to the help center.
// ponytail: IDs from tawk.to → Administration → Chat Widget
var TAWK_PROPERTY_ID = "68c2cb59e040891921fd9d95";
var TAWK_WIDGET_ID = "1j4sekled";

if (TAWK_WIDGET_ID && !window.Tawk_API) {
  // The embed script reads these globals, so set them on window explicitly.
  window.Tawk_API = {};
  window.Tawk_LoadStart = new Date();
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://embed.tawk.to/" + TAWK_PROPERTY_ID + "/" + TAWK_WIDGET_ID;
  s.charset = "UTF-8";
  s.setAttribute("crossorigin", "*");
  document.head.appendChild(s);
}

document.addEventListener(
  "click",
  function (e) {
    var a = e.target.closest && e.target.closest('a[href$="#create-ticket"]');
    if (!a || !window.Tawk_API || typeof window.Tawk_API.maximize !== "function") return;
    e.preventDefault();
    e.stopPropagation();
    window.Tawk_API.maximize();
  },
  true
);
