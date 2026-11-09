/* ==========================================================================
   SKRIP LOS BROTHERHOOD
   Mengatur: link WhatsApp, menu navigasi di HP, filter kategori menu,
   penanda bagian yang sedang dilihat, dan link Google Maps.
   Pengaturan nomor ada di config.js, bukan di sini.
   ========================================================================== */

(function () {
  "use strict";

  var cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  var number = String(cfg.whatsappNumber || "").replace(/\D/g, "");

  if (number === "62800000000") {
    console.info("Los Brotherhood: nomor WhatsApp masih contoh. Ganti di js/config.js.");
  }

  function waLink(text) {
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  function openInNewTab(link) {
    link.target = "_blank";
    link.rel = "noopener";
  }

  /* ---------- 1. Tombol WhatsApp umum ---------- */
  document.querySelectorAll("[data-wa]").forEach(function (link) {
    link.href = waLink(cfg.generalMessage || "");
    openInNewTab(link);
  });

  /* (Bagian 2: tombol Tambah di tiap menu ada di bagian Keranjang, paling bawah) */

  /* ---------- 3. Nomor WhatsApp tampil rapi di bagian kontak ---------- */
  var local = number.replace(/^62/, "");
  var parts = local.match(/^(\d{3})(\d{4})(\d+)$/);
  var shown = parts ? "+62 " + parts[1] + "-" + parts[2] + "-" + parts[3] : "+" + number;
  document.querySelectorAll("[data-wa-text]").forEach(function (el) {
    el.textContent = shown;
  });

  /* ---------- 4. TikTok (tampil hanya jika diisi di config.js) ---------- */
  var handle = String(cfg.tiktok || "").replace(/^@/, "").trim();
  var igRow = document.querySelector("[data-tiktok-row]");
  var igLink = document.querySelector("[data-tiktok-link]");
  if (handle && igRow && igLink) {
    igLink.href = "https://www.tiktok.com/@" + encodeURIComponent(handle);
    igLink.textContent = "@" + handle;
    openInNewTab(igLink);
    igRow.hidden = false;
  }

  /* ---------- 5. Link Google Maps dibuat dari teks alamat ---------- */
  var address = document.getElementById("alamat");
  var mapsLink = document.querySelector("[data-maps]");
  if (address && mapsLink) {
    mapsLink.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address.textContent.trim());
    openInNewTab(mapsLink);
  }

  /* ---------- 6. Tahun di footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- 7. Menu navigasi di HP ---------- */
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector(".nav-toggle");

  function setMenu(open) {
    header.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
  }

  if (header && toggle) {
    toggle.addEventListener("click", function () {
      setMenu(!header.classList.contains("is-open"));
    });
    header.querySelectorAll(".site-nav a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && header.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener("click", function (event) {
      if (header.classList.contains("is-open") && !header.contains(event.target)) setMenu(false);
    });
  }

  /* ---------- 8. Filter kategori menu ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var cards = document.querySelectorAll(".menu-card");
  var status = document.getElementById("filter-status");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      var shown = 0;

      chips.forEach(function (other) {
        var active = other === chip;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });

      cards.forEach(function (card) {
        var match = filter === "semua" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
        if (match) shown += 1;
      });

      if (status) status.textContent = "Menampilkan " + shown + " menu";
    });
  });

  /* ---------- 9. Tandai link navigasi sesuai bagian yang sedang dilihat ---------- */
  var navLinks = document.querySelectorAll(".nav-list a");
  var sections = document.querySelectorAll("main section[id]");

  if ("IntersectionObserver" in window && navLinks.length && sections.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + entry.target.id) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------- 10. Slider foto suasana ---------- */
  var slider = document.querySelector(".slider");
  if (slider) {
    var track = slider.querySelector(".slides");
    var slides = slider.querySelectorAll(".slide");
    var dotsBox = slider.querySelector(".slider-dots");
    var SECONDS = 4.5;               // lama tiap foto tampil (detik), ubah di sini
    var current = 0;
    var timer = null;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Foto " + (i + 1) + " dari " + slides.length);
      dot.addEventListener("click", function () { goTo(i); });
      dotsBox.appendChild(dot);
    });
    var dots = dotsBox.querySelectorAll("button");

    function mark(i) {
      current = i;
      dots.forEach(function (d, k) {
        if (k === i) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
      });
    }

    function goTo(i) {
      i = (i + slides.length) % slides.length;
      track.scrollTo({ left: i * track.clientWidth, behavior: reduceMotion ? "auto" : "smooth" });
      mark(i);
    }

    track.addEventListener("scroll", function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== current) mark(i);
    }, { passive: true });

    slider.querySelector(".slider-prev").addEventListener("click", function () { goTo(current - 1); });
    slider.querySelector(".slider-next").addEventListener("click", function () { goTo(current + 1); });

    function stop() { clearInterval(timer); timer = null; }
    function play() {
      if (reduceMotion || timer || document.hidden) return;
      timer = setInterval(function () { goTo(current + 1); }, SECONDS * 1000);
    }

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", play);
    slider.addEventListener("touchstart", stop, { passive: true });
    slider.addEventListener("touchend", function () { setTimeout(play, 6000); }, { passive: true });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else play(); });
    window.addEventListener("resize", function () { track.scrollTo({ left: current * track.clientWidth, behavior: "auto" }); });

    mark(0);
    play();
  }

  /* ---------- 11. Keranjang pesanan ---------- */
  var STORE_KEY = "los-brotherhood-keranjang";
  var dialog = document.getElementById("cart");
  var cartItemsEl = document.querySelector("[data-cart-items]");
  var cartEmpty = document.querySelector("[data-cart-empty]");
  var cartFoot = document.querySelector("[data-cart-foot]");
  var cartTotalEl = document.querySelector("[data-cart-total]");
  var cartFloat = document.querySelector(".cart-float");
  var cartCount = document.querySelector("[data-cart-count]");
  var cartStatus = document.getElementById("cart-status");
  var sendLink = document.querySelector("[data-cart-send]");
  var nameInput = document.getElementById("cart-name");
  var noteInput = document.getElementById("cart-note");

  var menu = {};        // nama menu -> { price: angka }
  var cart = {};        // nama menu -> jumlah

  function rupiah(n) { return "Rp " + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }

  document.querySelectorAll(".menu-card").forEach(function (card) {
    var nameEl = card.querySelector(".menu-name");
    var priceEl = card.querySelector(".menu-price");
    var add = card.querySelector("[data-add]");
    if (!nameEl || !priceEl || !add) return;
    var name = nameEl.textContent.trim();
    menu[name] = { price: parseInt(priceEl.textContent.replace(/\D/g, ""), 10) || 0 };
    add.setAttribute("aria-label", "Tambah " + name + " ke keranjang");
    add.addEventListener("click", function () {
      cart[name] = (cart[name] || 0) + 1;
      save();
      render();
      add.textContent = "Ditambahkan";
      add.classList.add("is-added");
      if (cartStatus) cartStatus.textContent = name + " ditambahkan. Jumlah di keranjang: " + cart[name];
      setTimeout(function () { add.textContent = "Tambah"; add.classList.remove("is-added"); }, 1200);
    });
  });

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      Object.keys(saved).forEach(function (name) {
        if (menu[name] && saved[name] > 0) cart[name] = Math.min(99, saved[name] | 0);
      });
    } catch (e) { cart = {}; }
  }

  function buildMessage() {
    var lines = [], total = 0;
    Object.keys(cart).forEach(function (name) {
      var sum = menu[name].price * cart[name];
      total += sum;
      lines.push("- " + cart[name] + "x " + name + " (" + rupiah(sum) + ")");
    });
    var text = (cfg.orderMessage || "Halo, saya mau pesan:") + "\n" + lines.join("\n") + "\n\nTotal: " + rupiah(total);
    var who = nameInput.value.trim();
    var note = noteInput.value.trim();
    text += "\nAtas nama: " + (who || "-");
    if (note) text += "\nCatatan: " + note;
    return text;
  }

  function render() {
    var names = Object.keys(cart);
    var count = 0, total = 0;
    cartItemsEl.textContent = "";

    names.forEach(function (name) {
      var qty = cart[name], price = menu[name].price;
      count += qty; total += price * qty;

      var li = document.createElement("li");
      li.className = "cart-item";

      var info = document.createElement("div");
      var title = document.createElement("p");
      title.className = "cart-item-name"; title.textContent = name;
      var each = document.createElement("p");
      each.className = "cart-item-price"; each.textContent = rupiah(price) + " per porsi";
      info.appendChild(title); info.appendChild(each);

      var sum = document.createElement("p");
      sum.className = "cart-item-sum"; sum.textContent = rupiah(price * qty);

      var qtyBox = document.createElement("div");
      qtyBox.className = "qty";
      var minus = document.createElement("button");
      minus.type = "button"; minus.textContent = "\u2212";
      minus.setAttribute("aria-label", "Kurangi " + name);
      minus.addEventListener("click", function () { change(name, -1); });
      var out = document.createElement("output");
      out.textContent = qty;
      var plus = document.createElement("button");
      plus.type = "button"; plus.textContent = "+";
      plus.setAttribute("aria-label", "Tambah " + name);
      plus.addEventListener("click", function () { change(name, 1); });
      qtyBox.appendChild(minus); qtyBox.appendChild(out); qtyBox.appendChild(plus);

      li.appendChild(info); li.appendChild(sum); li.appendChild(qtyBox);
      cartItemsEl.appendChild(li);
    });

    cartCount.textContent = count;
    cartFloat.hidden = count === 0;
    cartEmpty.hidden = count > 0;
    cartFoot.hidden = count === 0;
    cartTotalEl.textContent = rupiah(total);
    if (count > 0) {
      sendLink.href = "https://wa.me/" + number + "?text=" + encodeURIComponent(buildMessage());
      openInNewTab(sendLink);
    }
  }

  function change(name, delta) {
    cart[name] = (cart[name] || 0) + delta;
    if (cart[name] <= 0) delete cart[name];
    if (cart[name] > 99) cart[name] = 99;
    save();
    render();
    if (!Object.keys(cart).length) closeCart();
  }

  function openCart() {
    render();
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    document.body.classList.add("cart-open");
  }
  function closeCart() {
    if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open");
    document.body.classList.remove("cart-open");
  }

  if (dialog && cartFloat) {
    cartFloat.addEventListener("click", openCart);
    dialog.querySelector("[data-cart-close]").addEventListener("click", closeCart);
    dialog.addEventListener("click", function (event) { if (event.target === dialog) closeCart(); });
    dialog.addEventListener("close", function () { document.body.classList.remove("cart-open"); });
    dialog.querySelector("[data-cart-clear]").addEventListener("click", function () {
      cart = {}; save(); render(); closeCart();
    });
    nameInput.addEventListener("input", render);
    noteInput.addEventListener("input", render);
    load();
    render();
  }
})();
