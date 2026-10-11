function baseState(tur, total, cooling) {
  return { t: 37.5, tt: 37.5, h: 55, th: 55, day: 1, total: total, hr: 0, tur: tur, clk: [9, 0], cooling: cooling, alarm: 0, off: false, status: "Gelişim devam ediyor",
    out: { heater: true, circ: true, hum: true, pump: false, cool: false, viyol: true, siren: false } };
}

/* Çıkışlar canlı gibi açılıp kapanır (görsel canlandırma) */
function cycle(s) {
  s.out.heater = Math.random() < 0.55;
  s.out.hum = Math.random() < 0.35;
  s.out.circ = true;
  if (Math.random() < 0.08) s.out.viyol = !s.out.viyol;
  if (s.cooling && !s.out.cool) s.out.pump = false;
}

/* Ana ekran: hafifçe oynayan canlı değerler */
(function () {
  var upd = buildScreen($("scr-hero"));
  var s = baseState("Kaz", 30, true); s.day = 12; s.hr = 4; s.clk = [14, 32];
  upd(s);
  if (REDUCE) return;
  setInterval(function () {
    s.t = 37.5 + (Math.random() - .5) * .2;
    s.h = 55 + (Math.random() - .5) * 2;
    cycle(s);
    s.clk[1] += 1; if (s.clk[1] > 59) { s.clk[1] = 0; s.clk[0] = (s.clk[0] + 1) % 24; }
    upd(s);
  }, 1700);
})();

/* ---------- Canlı demo: senaryolu, gerçek çalışma mantığı içermez ---------- */
(function () {
  var root = $("scr-demo"), upd = buildScreen(root), log = $("log");
  var s, busy, flags, tur = { t: "Tavuk", n: 21 };
  var ids = ["d-gun", "d-kapi", "d-elk", "d-nem", "d-sens", "d-sog", "d-sul", "d-des", "d-gun2"];
  var B = {}; ids.forEach(function (i) { B[i] = $(i); });
  var emoji = { "Tavuk": "🐔", "Kaz": "🪿", "Misk ördeği": "🦆" };

  function clock() { return String(s.clk[0]).padStart(2, "0") + ":" + String(s.clk[1]).padStart(2, "0"); }
  function say(t, cls, buttons) {
    var d = document.createElement("div");
    d.className = "msg" + (cls ? " " + cls : "");
    d.appendChild(document.createTextNode(t));
    if (buttons) {
      var bt = document.createElement("div"); bt.className = "bt";
      buttons.forEach(function (b) {
        var x = document.createElement("button"); x.type = "button"; x.textContent = b[0];
        x.addEventListener("click", function () { Array.prototype.forEach.call(bt.children, function (c) { c.disabled = true; }); b[1](); });
        bt.appendChild(x);
      });
      d.appendChild(bt);
    }
    var tm = document.createElement("time"); tm.textContent = clock(); d.appendChild(tm);
    log.appendChild(d); log.scrollTop = log.scrollHeight;
  }
  function tick(min) { var m = s.clk[0] * 60 + s.clk[1] + min; s.clk = [Math.floor(m / 60) % 24, m % 60]; }
  function tween(from, to, ms, fn, done) {
    if (REDUCE) { fn(to); if (done) done(); return; }
    var t0 = performance.now();
    (function f(now) {
      var k = Math.min(1, (now - t0) / ms);
      fn(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(f); else if (done) done();
    })(t0);
  }
  function lock(v) {
    busy = v;
    ids.forEach(function (i) { B[i].disabled = v; });
    if (!v && s.day >= s.total) B["d-gun"].disabled = true;
  }
  function norm() { s.alarm = 0; s.out.siren = false; s.status = s.day >= s.total - 2 ? "Çıkım dönemi" : "Gelişim devam ediyor"; }
  function warn(msg) { s.alarm = 1; s.status = msg; }

  function reset() {
    s = baseState(tur.t, tur.n, tur.t !== "Tavuk");
    flags = { cikim: false, bitti: false };
    log.innerHTML = "";
    upd(s); lock(false);
    say("🌙 ULU BEYİN sistemi başlatıldı. Bismillah, hayırlı ve bereketli bir kuluçka süreci diliyoruz.");
    say(emoji[tur.t] + " " + tur.t + " kuluçkası başladı. " + (s.cooling ? "Soğutma ve sulama otomatik." : "Bu tür için soğutma gerekmez."));
  }

  Array.prototype.forEach.call(document.querySelectorAll("#d-tur button"), function (b) {
    b.addEventListener("click", function () {
      Array.prototype.forEach.call(document.querySelectorAll("#d-tur button"), function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      tur = { t: b.getAttribute("data-t"), n: parseInt(b.getAttribute("data-n"), 10) };
      reset();
    });
  });

  B["d-gun"].addEventListener("click", function () {
    if (busy || s.day >= s.total) return;
    s.day++; tick(24 * 60); s.hr = 4; norm();
    if (s.cooling && s.day >= 5 && s.day < s.total - 2) {
      s.out.cool = true; s.out.pump = true; s.status = "Günlük soğutma ve sulama yapılıyor"; upd(s);
      say("❄ Günlük soğutma ve sulama otomatik tamamlandı.");
      setTimeout(function () { s.out.cool = false; s.out.pump = false; norm(); upd(s); }, 1200);
    }
    if (s.day >= s.total - 2 && !flags.cikim) {
      flags.cikim = true; s.th = 75; s.out.viyol = false; norm();
      say("💧 Çıkım dönemi başladı. Nem hedefi otomatik yükseltildi, viyol durdu. Bu süreçte kapağı açmamanız önerilir.", "ok");
    }
    if (s.day >= s.total && !flags.bitti) {
      flags.bitti = true; s.status = "Süre doldu, çıkım onayı bekleniyor";
      say("✅ " + s.tur + " kuluçkası başarıyla tamamlandı! Emeğiniz hayırlara vesile olsun, Allah bereket versin. 🐣", "ok");
    }
    upd(s); lock(false);
  });

  B["d-kapi"].addEventListener("click", function () {
    if (busy) return; lock(true);
    tween(s.t, 35.9, 1100, function (v) { s.t = v; upd(s); }, function () {
      tick(12); warn("Sıcaklık hedefin altında"); s.out.heater = true; upd(s);
      say("⚠ Sıcaklık hedefin altında: 35,9°C (hedef 37,5°C). Kapağın kapalı olduğunu ve ısıtıcının çalıştığını kontrol edin.", "warn");
      setTimeout(function () {
        tween(s.t, 37.4, 1500, function (v) { s.t = v; upd(s); }, function () {
          tick(20); norm(); upd(s); say("✅ Sıcaklık hedefe döndü (37,4°C).", "ok"); lock(false);
        });
      }, 1500);
    });
  });

  B["d-elk"].addEventListener("click", function () {
    if (busy) return; lock(true);
    s.off = true; s.out.heater = false; s.out.circ = false; s.out.viyol = false; upd(s); say("⚡ Elektrik kesildi. Kuluçka verileri güvende.", "warn");
    setTimeout(function () {
      s.off = false; s.out.heater = true; s.out.circ = true; s.out.viyol = true; tick(134); s.t = 36.9; norm(); upd(s);
      say("🔌 Elektrik geldi. Kesinti süresi: 2 sa 14 dk. Kabin sıcaklığı: 36,9°C. Kuluçka kaldığı yerden devam ediyor.", "ok");
      tween(36.9, 37.5, 1500, function (v) { s.t = v; upd(s); }, function () { lock(false); });
    }, 2200);
  });

  B["d-nem"].addEventListener("click", function () {
    if (busy) return; lock(true);
    tween(s.h, 44, 1000, function (v) { s.h = v; upd(s); }, function () {
      tick(30); warn("Nem hedefin altında"); s.out.hum = true; upd(s);
      say("⚠ Nem hedefin altında: %44 (hedef %" + s.th + "). Nemlendirici çalışıyor, su deposunu kontrol edin.", "warn");
      setTimeout(function () {
        tween(s.h, s.th - 1, 1500, function (v) { s.h = v; upd(s); }, function () {
          tick(40); s.out.hum = false; norm(); upd(s); say("✅ Nem normale döndü (%" + Math.round(s.h) + ").", "ok"); lock(false);
        });
      }, 1400);
    });
  });

  B["d-sens"].addEventListener("click", function () {
    if (busy) return; lock(true);
    warn("Sensör arızası: Bölge 2"); s.alarm = 2; s.out.siren = true; upd(s);
    say("🚨 Sensör arızası: Bölge 2 sensörü yanıt vermiyor. Isıtma diğer sensörle güvenli şekilde sürüyor. Lütfen sensör bağlantısını kontrol edin.", "warn");
    setTimeout(function () { tick(18); norm(); upd(s); say("✅ Bölge 2 sensörü yeniden yanıt veriyor. Normal çalışmaya dönüldü.", "ok"); lock(false); }, 2600);
  });

  B["d-sog"].addEventListener("click", function () {
    if (busy) return;
    if (!s.cooling) { say("ℹ Bu tür için soğutma gerekmez.", ""); return; }
    lock(true); s.out.cool = true; s.status = "Soğutma (manuel) çalışıyor"; upd(s);
    say("❄ Soğutma manuel başlatıldı. Süre dolunca otomatik biter.");
    setTimeout(function () { s.out.cool = false; norm(); upd(s); say("✅ Soğutma tamamlandı.", "ok"); lock(false); }, 1800);
  });

  B["d-sul"].addEventListener("click", function () {
    if (busy) return;
    if (!s.cooling) { say("ℹ Bu tür için sulama gerekmez.", ""); return; }
    lock(true); s.out.pump = true; s.status = "Sulama (manuel) çalışıyor"; upd(s);
    say("💦 Sulama manuel başlatıldı.");
    setTimeout(function () { s.out.pump = false; norm(); upd(s); say("✅ Sulama tamamlandı.", "ok"); lock(false); }, 1500);
  });

  B["d-des"].addEventListener("click", function () {
    if (busy) return;
    say("🛟 Destek erişimi 24 saat için açıldı. Destek ekibine bildirim gitti.", "ok");
    say("👤 Destek ekibi: Merhaba, talebinizi aldık. Hemen bakıyoruz.");
  });

  B["d-gun2"].addEventListener("click", function () {
    if (busy) return; lock(true);
    say("🆕 Yeni yazılım sürümü hazır. Güncellemenin imzası doğrulandı. Onaylarsanız sıcaklık uygun olduğunda yüklenir.", "", [
      ["Onayla", function () {
        s.status = "Güncelleme yükleniyor"; upd(s);
        setTimeout(function () { tick(2); norm(); upd(s); say("✅ Güncelleme yüklendi, cihaz yeniden başladı. Kuluçka kaldığı yerden devam ediyor.", "ok"); lock(false); }, 1800);
      }],
      ["Reddet", function () { say("Güncelleme ertelendi. Dilediğiniz zaman tekrar başlatabilirsiniz."); lock(false); }]
    ]);
  });

  if (!REDUCE) setInterval(function () {
    if (busy || s.off || s.alarm) return;
    s.t = 37.5 + (Math.random() - .5) * .2; s.h = (s.day >= s.total - 2 ? 75 : 55) + (Math.random() - .5) * 2;
    cycle(s); upd(s);
  }, 1700);
  $("d-sifir").addEventListener("click", reset);
  reset();
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
