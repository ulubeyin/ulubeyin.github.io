var WA_NUMBER = "905467602893";
var REDUCE = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function (id) { return document.getElementById(id); };
function fmt1(n) { return n.toFixed(1).replace(".", ","); }
function waLink(text) { return "https://wa.me/" + WA_NUMBER + (text ? "?text=" + encodeURIComponent(text) : ""); }

/* Sabit WhatsApp düğmesi: sipariş ve iletişim bölümlerinde gizlenir */
(function () {
  var fl = $("wa3"); if (!fl) return;
  fl.href = waLink("Merhaba, ULU BEYİN hakkında bilgi almak istiyorum.");
  if ($("wa2")) $("wa2").href = fl.href;
  if (!("IntersectionObserver" in window)) return;
  var seen = {};
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
    fl.classList.toggle("hide", !!(seen.siparis || seen.iletisim));
  }, { threshold: 0.15 });
  ["siparis", "iletisim"].forEach(function (id) { if ($(id)) io.observe($(id)); });
})();

/* Cihaz ekranı çizimi: cihazın ana ekranıyla aynı düzen */
var ICO = { "Tavuk": "🐔", "Kaz": "🪿", "Misk ördeği": "🦆" };
function buildScreen(root) {
  root.innerHTML = '<div class="scw"><div class="sc">' +
    '<div class="sb"><span>ULU BEYİN V1.12</span><span>WiFi<span class="wf" aria-hidden="true"><i></i><i></i><i></i><i></i></span>%80</span></div>' +
    '<div class="sm2"><div><div class="zn"><div><div class="k">Bölge 1</div><div class="n" data-k="t1"></div></div><div><div class="k">Bölge 2</div><div class="n" data-k="t2"></div></div></div><div class="nm" data-k="nem"></div></div>' +
    '<div class="rt"><div class="ico" data-k="ico"></div><div class="tn" data-k="tur"></div><div data-k="gun"></div><div class="mu" data-k="egg"></div><div class="mu" data-k="hed"></div></div></div>' +
    '<div class="hs" data-k="hs"></div><div data-k="al"></div><div class="bt2" data-k="bt"></div></div></div>';
  var scw = root.querySelector(".scw"), sc = root.querySelector(".sc");
  function fit() { var k = scw.clientWidth / 480; sc.style.transform = "scale(" + k + ")"; }
  fit();
  if (window.ResizeObserver) new ResizeObserver(fit).observe(scw); else window.addEventListener("resize", fit);
  var q = function (k) { return root.querySelector('[data-k="' + k + '"]'); };
  return function update(s) {
    q("t1").textContent = fmt1(s.t) + "°C";
    q("t2").textContent = fmt1(s.t + 0.1) + "°C";
    q("nem").textContent = "Nem %" + Math.round(s.h);
    q("ico").textContent = ICO[s.tur] || "🥚";
    q("tur").textContent = s.tur;
    q("gun").textContent = "Gün " + s.day + "/" + s.total;
    q("egg").textContent = "Yumurta " + (s.eggs || 60);
    q("hed").textContent = "🎯 " + fmt1(s.tt) + "°C · %" + s.th;
    var L = [["heater", "🔥 Isıtıcı"], ["circ", "🌀 Sirkülasyon"], ["hum", "💧 Nem"], ["pump", "💦 Pompa"], ["cool", "❄ Soğutma"], ["viyol", "🔄 Viyol"], ["siren", "🔔 Siren"]];
    var hs = q("hs");
    if (!hs.children.length) hs.innerHTML = L.map(function (x) { return '<span data-o="' + x[0] + '">' + x[1] + '</span>'; }).join("");
    Array.prototype.forEach.call(hs.children, function (e) { e.classList.toggle("on", !!s.out[e.getAttribute("data-o")]); });
    q("al").innerHTML = s.alarm ? '<div class="al' + (s.alarm === 2 ? " e" : "") + '">⚠ ' + s.status + '</div>' : "";
    var ph = s.day >= s.total ? 3 : s.day >= s.total - 2 ? 2 : 1, b = [];
    if (ph === 3) { b.push(["Ek süre +12s", ""]); b.push(["Şimdi bitir", "r"]); }
    else {
      b.push(["Yumurta", ""]);
      if (ph === 2) b.push(["Onayla", "p"]);
      if (ph === 1 && s.cooling) { b.push(["Soğutma", s.out.cool ? "on" : ""]); b.push(["Sulama", s.out.pump ? "on" : ""]); }
      b.push(["İptal", ""]);
    }
    b.push(["Işıklar", ""]); b.push(["Ayarlar", ""]);
    q("bt").innerHTML = b.map(function (x) { return '<span class="' + x[1] + '">' + x[0] + '</span>'; }).join("");
    root.classList.toggle("off", !!s.off);
  };
}
