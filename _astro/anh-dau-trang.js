/* Ảnh đầu trang chủ: 2 ảnh xếp ngang, ảnh mặt tiền có biển hiện trước.
   Vuốt (điện thoại) hoặc kéo ngang bàn di chuột để sang ảnh sau — trình duyệt tự làm, không cần file này.
   File này chỉ thêm: nút mũi tên trái/phải, chấm cho biết đang xem ảnh nào (bấm chấm để nhảy tới ảnh đó),
   kéo bằng chuột trên máy tính. Không có JavaScript thì nút và chấm ẩn, vuốt vẫn chạy. */
(function () {
  var khung = document.querySelector('.hero-truot');
  if (!khung) return;
  var day = khung.querySelector('.hero-day');
  var trang = [].slice.call(day.children);
  var cham = [].slice.call(khung.querySelectorAll('.hero-cham button'));
  var nutTruoc = khung.querySelector('.hero-truoc');
  var nutSau = khung.querySelector('.hero-sau');
  if (trang.length < 2) return;

  var giamChuyenDong = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dangO = 0;

  function toi(i) {
    i = (i + trang.length) % trang.length; // ảnh cuối bấm "sau" thì quay về ảnh đầu
    day.scrollTo({ left: trang[i].offsetLeft, behavior: giamChuyenDong ? 'auto' : 'smooth' });
  }

  function danhDau(i) {
    if (i === dangO) return;
    dangO = i;
    cham.forEach(function (c, k) { c.setAttribute('aria-current', k === i ? 'true' : 'false'); });
  }

  // ảnh nào chiếm quá nửa khung thì coi là đang xem ảnh đó
  var choVe = false;
  day.addEventListener('scroll', function () {
    if (choVe) return;
    choVe = true;
    requestAnimationFrame(function () {
      choVe = false;
      danhDau(Math.max(0, Math.min(trang.length - 1, Math.round(day.scrollLeft / day.clientWidth))));
    });
  }, { passive: true });

  nutTruoc.addEventListener('click', function () { toi(dangO - 1); });
  nutSau.addEventListener('click', function () { toi(dangO + 1); });
  cham.forEach(function (c, k) { c.addEventListener('click', function () { toi(k); }); });

  // máy tính: giữ chuột kéo ngang như vuốt trên điện thoại.
  // Lúc kéo tạm tắt "hít" ảnh (class dang-keo), thả tay thì trượt tới ảnh đích rồi mới bật lại để khỏi giật.
  var keo = null, henBat = 0;
  function batLaiHit() {
    clearTimeout(henBat);
    day.removeEventListener('scrollend', batLaiHit);
    khung.classList.remove('dang-keo');
  }
  day.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    keo = { x: e.clientX, trai: day.scrollLeft, tu: dangO, xa: false };
  });
  window.addEventListener('pointermove', function (e) {
    if (!keo) return;
    var dx = e.clientX - keo.x;
    if (!keo.xa && Math.abs(dx) > 4) { keo.xa = true; batLaiHit(); khung.classList.add('dang-keo'); }
    if (keo.xa) day.scrollLeft = keo.trai - dx;
  });
  window.addEventListener('pointerup', function (e) {
    if (!keo) return;
    var dx = e.clientX - keo.x, xa = keo.xa, tu = keo.tu;
    keo = null;
    if (!xa) return;
    // kéo quá 1/6 khung thì sang ảnh bên cạnh, chưa đủ thì trả về ảnh cũ
    var buoc = Math.abs(dx) > day.clientWidth / 6 ? (dx < 0 ? 1 : -1) : 0;
    var dich = Math.max(0, Math.min(trang.length - 1, tu + buoc));
    var trai = trang[dich].offsetLeft;
    if (Math.abs(day.scrollLeft - trai) < 1) { batLaiHit(); return; }
    day.addEventListener('scrollend', batLaiHit);
    henBat = setTimeout(batLaiHit, 700); // trình duyệt chưa có sự kiện scrollend
    day.scrollTo({ left: trai, behavior: giamChuyenDong ? 'auto' : 'smooth' });
  });
  // ảnh không bị kéo ra ngoài như kéo file
  day.addEventListener('dragstart', function (e) { e.preventDefault(); });

  khung.classList.add('co-js');
})();
