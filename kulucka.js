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

/* ---------- Hazır tür kartları: dokununca cihazdaki değerler ---------- */
(function () {
  var box = $("modes"), panel = $("mspec"), hint = $("mhint"); if (!box || !panel) return;
  var STD_COOL = "5. günden sonra her gün 12:00'de otomatik (5–7. gün 5 dk, 8–9. gün 10 dk, 10. gün 15 dk, 11. gün 20 dk, 12. günden sonra 25 dk) ya da manuel";
  var M = {
    "Tavuk": [21, 37.6, 55, 70], "Hindi": [28, 37.5, 55, 75], "Bıldırcın": [17, 37.6, 55, 70], "Kaz": [30, 37.5, 55, 75, 1],
    "Ördek": [28, 37.5, 55, 80, 1], "Misk ördeği": [35, 37.5, 55, 80, 1], "Sülün": [24, 37.6, 58, 75], "Keklik": [24, 37.6, 50, 70]
  };
  function row(a, b) { return "<tr><td>" + a + "</td><td>" + b + "</td></tr>"; }
  function show(name) {
    Array.prototype.forEach.call(box.querySelectorAll(".mode"), function (b) { var on = b.getAttribute("data-m") === name; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
    var h;
    if (name === "Özel mod") {
      h = "<h3>Özel mod</h3><div class='sub'>Listede olmayan bir tür için: her değeri siz belirlersiniz. Adını verip kaydedersiniz (10 kayıt).</div><table>" +
        row("Hedef sıcaklık", "25–40 °C (zorunlu, atlanamaz)") + row("Hedef nem", "%20–95") + row("Süre", "1–365 gün ya da süresiz") +
        row("Çıkım dönemi", "0–7 gün; çıkım sıcaklığı ve nemini siz seçersiniz") +
        row("Soğutma ve sulama", "Standart ya da kendi başlangıç günü, saati, kaç günde bir ve süreniz (cihazda varsa)") +
        row("Viyol", "Hemen, manuel ya da belirli günde başlat; bitiş gününü seçin") +
        row("Uyarılar", "Sıcaklık ve nem sapma farkını siz seçersiniz") +
        row("Güvenlik", "Aşırı ısınma ve soğuma alarmları her zaman sabit çalışır") + "</table>";
    } else {
      var d = M[name], t = d[1], c = d[4];
      h = "<h3>" + name + "</h3><div class='sub'>Cihazdaki hazır program. Türü seçersiniz, gerisini cihaz yönetir.</div><table>" +
        row("Süre", d[0] + " gün") + row("Gelişim sıcaklığı", fmt1(t) + " °C") + row("Gelişim nemi", "%" + d[2]) +
        row("Çıkım dönemi", "Son 3 gün · " + fmt1(t - 0.3) + " °C · nem %" + d[3]) +
        row("Soğutma ve sulama", c ? STD_COOL + ". Sulama 15 sn." : "Bu türde yapılmaz") +
        row("Viyol", "Kuluçkayla birlikte başlar, çıkım döneminde durur" + (c ? " (başlangıcı isterseniz değiştirebilirsiniz)" : "")) + "</table>";
    }
    panel.innerHTML = h; panel.hidden = false; if (hint) hint.hidden = true;
  }
  box.addEventListener("click", function (e) { var b = e.target.closest(".mode"); if (b) show(b.getAttribute("data-m")); });
})();

/* ---------- Sipariş ---------- */
/* Not: ileride sanal pos / ödeme bağlanırken siparisVerisi() çıktısı doğrudan gönderilebilir (alan adları sabit). */
(function () {
  var adet = 1, MAXA = 49;
  var adetEl = $("adet"), eksi = $("eksi"), arti = $("arti");
  function kul() { return document.querySelector('input[name="kul"]:checked').value; }
  function top() { return document.querySelector('input[name="top"]:checked').value; }
  function toplu() { return kul() === "Toplu alım"; }
  function v(id) { return ($(id).value || "").trim(); }
  function adetMetni() { return toplu() ? top() + " adet" : adet + " adet"; }
  function siparisVerisi() {
    return { urun: "ULU BEYİN Kuluçka Kontrol Ünitesi", tur: kul(), adet: adetMetni(), firma: toplu() ? v("firma") : "", ad: v("ad"), tel: v("tel"), il: v("il"), ilce: v("ilce"), posta: v("posta"), adres: v("adres"), eposta: v("eposta"), not: v("not") };
  }
  window.siparisVerisi = siparisVerisi;
  function eksik(d) {
    var e = [];
    if (!d.ad) e.push("ad soyad");
    if (d.tel.replace(/\D/g, "").length < 10) e.push("telefon");
    if (!d.il) e.push("il");
    if (!d.ilce) e.push("ilçe");
    if (d.adres.length < 8) e.push("açık adres");
    return e;
  }
  function ozet(d) {
    var s = ["ÜRÜN: " + d.urun, "SİPARİŞ: " + d.tur + " · " + d.adet, ""];
    if (d.firma) s.push("FİRMA: " + d.firma);
    s.push("ALICI: " + (d.ad || "—"), "TELEFON: " + (d.tel || "—"), "ADRES: " + (d.adres || "—"), "İLÇE / İL: " + ((d.ilce || "—") + " / " + (d.il || "—")));
    if (d.posta) s.push("POSTA KODU: " + d.posta);
    if (d.eposta) s.push("E-POSTA: " + d.eposta);
    if (d.not) s.push("", "NOT: " + d.not);
    return s.join("\n");
  }
  function mesaj() { return "Merhaba, sipariş vermek istiyorum.\n\n" + ozet(siparisVerisi()); }
  function guncelle() {
    var t = toplu();
    $("adet-tek").hidden = t; $("adet-toplu").hidden = !t; $("firma-l").hidden = !t;
    adetEl.textContent = adet;
    eksi.disabled = adet <= 1; arti.disabled = adet >= MAXA;
    $("ozet").textContent = ozet(siparisVerisi());
    $("wa").href = waLink(mesaj());
  }
  eksi.addEventListener("click", function () { if (adet > 1) { adet--; guncelle(); } });
  arti.addEventListener("click", function () { if (adet < MAXA) { adet++; guncelle(); } });
  ["firma", "ad", "tel", "il", "ilce", "posta", "adres", "eposta", "not"].forEach(function (id) { $(id).addEventListener("input", guncelle); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="kul"], input[name="top"]'), function (r) { r.addEventListener("change", guncelle); });
  function uyar() { var e = eksik(siparisVerisi()); if (e.length) { $("durum").textContent = "Eksik bilgi: " + e.join(", ") + ". Yine de gönderebilirsiniz, eksikleri sizden isteriz."; return true; } $("durum").textContent = ""; return false; }
  $("wa").addEventListener("click", function () { uyar(); });
  // Panoya kopyala: kargo/sipariş bilgisi hazır biçimde. Instagram ve Telegram hazır mesaj kabul etmez: kopyalar, sohbeti açar.
  function kopyala(e, ek) {
    var d = $("durum"), m = ozet(siparisVerisi());
    function ok() { d.textContent = "Sipariş bilgileri kopyalandı." + (ek ? " Sohbete yapıştırıp gönderin." : ""); }
    function fail() { d.textContent = "Kopyalanamadı. Özet kutusundaki yazıyı seçip kopyalayabilirsiniz."; }
    try { navigator.clipboard.writeText(m).then(ok, fail); } catch (x) { fail(); }
  }
  $("kop").addEventListener("click", function (e) { kopyala(e, false); });
  $("ig").addEventListener("click", function (e) { kopyala(e, true); });
  $("tg").addEventListener("click", function (e) { kopyala(e, true); });
  guncelle();
})();
