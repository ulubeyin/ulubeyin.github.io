function baseState(tur, total, cooling) {
  return { t: 37.5, tt: 37.5, h: 55, th: 55, day: 1, total: total, hr: 0, tur: tur, clk: [9, 0], cooling: cooling, alarm: 0, off: false, status: "Gelişim devam ediyor",
    hw: { fan: 1, pump: 1, kab: 1, kon: 1 },
    out: { heater: true, circ: true, hum: true, pump: false, cool: false, viyol: true, kab: false, kon: false, siren: false } };
}

/* Soğutma veya sulama çalışırken ısıtıcı ve nemlendirici HER ZAMAN kapalı (cihaz yazılımıyla aynı kural) */
function wetOn(s) { s.out.heater = false; s.out.hum = false; }

/* Çıkışlar canlı gibi açılıp kapanır (görsel canlandırma) */
function cycle(s) {
  var wet = s.out.cool || s.out.pump;
  s.out.heater = wet ? false : Math.random() < 0.55;
  s.out.hum = wet ? false : Math.random() < 0.35;
  s.out.circ = true;
  if (Math.random() < 0.08) s.out.viyol = !s.out.viyol;
  if (s.cooling && !s.out.cool) s.out.pump = false;
}

/* Ana ekran: dokunulabilir gerçek cihaz ekranı (ekran.html, iframe) */
(function () {
  var f = $("hero-frame"); if (!f) return;
  window.addEventListener("message", function (e) {
    if (e.source === f.contentWindow && e.data && e.data.ub_demo_h) f.style.height = Math.min(900, e.data.ub_demo_h + 4) + "px";
  });
})();

/* ---------- Canlı demo: gerçek cihaz ekranı + Telegram (demo.html, iframe) ---------- */
(function () {
  var f = $("demo-frame"); if (!f) return;
  window.addEventListener("message", function (e) {
    if (e.source === f.contentWindow && e.data && e.data.ub_demo_h) f.style.height = Math.min(2400, e.data.ub_demo_h + 6) + "px";
  });
})();

/* ---------- Sipariş ---------- */
(function () {
  var adet = 1, MAXA = 9;
  var adetEl = $("adet"), eksi = $("eksi"), arti = $("arti");
  function kul() { return document.querySelector('input[name="kul"]:checked').value; }
  function top() { return document.querySelector('input[name="top"]:checked').value; }
  function toplu() { return kul() === "Toplu alım"; }
  function adetMetni() { return toplu() ? top() : adet + " adet"; }
  function mesaj() {
    var s = ["Merhaba, ULU BEYİN Kuluçka Kontrol Ünitesi sipariş etmek istiyorum.", "", "Sipariş türü: " + kul(), "Adet: " + adetMetni()];
    if ($("sehir").value.trim()) s.push("Teslimat şehri: " + $("sehir").value.trim());
    if ($("ad").value.trim()) s.push("Ad Soyad: " + $("ad").value.trim());
    if ($("not").value.trim()) { s.push(""); s.push("Not: " + $("not").value.trim()); }
    return s.join("\n");
  }
  function guncelle() {
    var t = toplu();
    $("adet-tek").hidden = t; $("adet-toplu").hidden = !t;
    adetEl.textContent = adet;
    eksi.disabled = adet <= 1; arti.disabled = adet >= MAXA;
    $("s-adet").textContent = adetMetni();
    $("s-kul").textContent = kul();
    $("s-sehir").textContent = $("sehir").value.trim() || "Belirtilmedi";
    $("wa").href = waLink(mesaj());
  }
  eksi.addEventListener("click", function () { if (adet > 1) { adet--; guncelle(); } });
  arti.addEventListener("click", function () { if (adet < MAXA) { adet++; guncelle(); } });
  ["ad", "sehir", "not"].forEach(function (id) { $(id).addEventListener("input", guncelle); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="kul"], input[name="top"]'), function (r) { r.addEventListener("change", guncelle); });

  // Instagram ve Telegram hazır mesaj kabul etmez: siparişi kopyalar, sohbeti açar.
  function kopyala() {
    var d = $("durum"), m = mesaj();
    function ok() { d.textContent = "Siparişiniz kopyalandı. Sohbete yapıştırıp gönderin."; }
    function fail() { d.textContent = "Kopyalanamadı. WhatsApp düğmesini kullanabilirsiniz."; }
    try { navigator.clipboard.writeText(m).then(ok, fail); } catch (e) { fail(); }
  }
  $("ig").addEventListener("click", kopyala);
  $("tg").addEventListener("click", kopyala);
  guncelle();
})();
