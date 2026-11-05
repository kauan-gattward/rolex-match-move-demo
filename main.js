/**
 * MATCH & MOVE → scroll scrub
 * ---------------------------------
 * Canva's Match & Move tweens the SAME elements between two pages
 * (translate + scale + a little rotation) in about half a second.
 * Nothing is wiped, masked, flipped or morphed.
 *
 * Here that 0.5s ease is stretched across a pinned scroll. The feel is a
 * Z-axis zoom-out with parallax: foreground pieces travel farther and
 * scale more than the background.
 *
 *   crown + ROLEX   huge gold label          →  smaller, slightly higher
 *   watch           cropped macro, low frame →  full shape, dead center (scale DOWN)
 *   OYSTER          tiny / hidden            →  massive muted word (scale UP)
 *   accents         off the edges            →  inward orbit, slight scale + rotate
 *
 * .layout-a and .layout-b are the two slides. Each [data-slot] is measured;
 * the matching [data-mm] node is the one that moves. To fork another brand,
 * edit the CSS tokens and those two layouts — do not hardcode distances here.
 */
(function () {
  const shell = document.getElementById("shell");
  const stage = document.getElementById("stage");
  const rail = document.querySelector(".rail > span");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!shell || !stage) return;

  const movers = Array.from(stage.querySelectorAll("[data-mm]"));
  let tl = null;

  function relBox(el) {
    const r = el.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    return {
      cx: r.left - s.left + r.width / 2,
      cy: r.top - s.top + r.height / 2,
      w: r.width,
      h: r.height,
    };
  }

  function measure() {
    const map = {};
    stage.querySelectorAll("[data-slot]").forEach((slot) => {
      const id = slot.dataset.slot;
      const which = slot.closest(".layout-a") ? "a" : "b";
      map[id] = map[id] || {};
      map[id][which] = relBox(slot);
    });
    return map;
  }

  function opacityFor(el, which) {
    const raw = el.dataset[which === "a" ? "opA" : "opB"];
    if (raw != null && raw !== "") return parseFloat(raw);
    const fade = el.dataset.fade || "shared";
    if (fade === "out") return which === "a" ? 1 : 0;
    if (fade === "in") return which === "a" ? 0 : 1;
    return 1;
  }

  /** Pose of a measured slot, expressed as a GSAP transform around the node center. */
  function pose(box, nat, el, which) {
    const w = nat.w || 1;
    return {
      x: box.cx - w / 2,
      y: box.cy - nat.h / 2,
      scale: box.w / w,
      rotation: parseFloat(el.dataset[which === "a" ? "rotA" : "rotB"] || "0") || 0,
      opacity: opacityFor(el, which),
    };
  }

  function setRail(progress) {
    if (rail) rail.style.transform = "scaleY(" + progress + ")";
  }

  function setupReduced() {
    document.documentElement.classList.add("reduced");
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    ScrollTrigger.create({
      trigger: shell,
      start: "top top",
      end: "+=230%",
      pin: true,
      anticipatePin: 1,
      onUpdate: function (self) {
        document.documentElement.classList.toggle("show-b", self.progress > 0.5);
        setRail(self.progress);
      },
    });
  }

  function setupMotion() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const cache = { boxes: null, nat: {} };

    function updateCache() {
      cache.boxes = measure();
      movers.forEach(function (el) {
        cache.nat[el.dataset.mm] = { w: el.offsetWidth, h: el.offsetHeight };
      });
    }

    function read(el, which) {
      const id = el.dataset.mm;
      const box = cache.boxes && cache.boxes[id] && cache.boxes[id][which];
      const nat = cache.nat[id];
      if (!box || !nat || !nat.w) return null;
      return pose(box, nat, el, which);
    }

    updateCache();

    tl = gsap.timeline({
      defaults: { ease: "power2.inOut", duration: 1, force3D: true },
      scrollTrigger: {
        trigger: shell,
        start: "top top",
        end: "+=230%",
        pin: true,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefreshInit: updateCache,
        onUpdate: function (self) {
          setRail(self.progress);
        },
      },
    });

    movers.forEach(function (el) {
      const fade = el.dataset.fade || "shared";
      if (!read(el, "a") || !read(el, "b")) return;

      const from = {
        x: function () { return read(el, "a").x; },
        y: function () { return read(el, "a").y; },
        scale: function () { return read(el, "a").scale; },
        rotation: function () { return read(el, "a").rotation; },
      };
      const to = {
        x: function () { return read(el, "b").x; },
        y: function () { return read(el, "b").y; },
        scale: function () { return read(el, "b").scale; },
        rotation: function () { return read(el, "b").rotation; },
        duration: 1,
        ease: "power2.inOut",
      };

      // Shared elements (the Match & Move set) carry opacity across the whole zoom.
      if (fade === "shared") {
        from.opacity = function () { return read(el, "a").opacity; };
        to.opacity = function () { return read(el, "b").opacity; };
      }

      tl.fromTo(el, from, to, 0);

      // Copy that belongs to only one slide fades at the edges of the zoom.
      if (fade === "out") {
        tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.28, ease: "power1.in" }, 0);
      } else if (fade === "in") {
        tl.fromTo(
          el,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: true },
          0.7
        );
      }
    });

    document.documentElement.classList.add("is-ready");
  }

  function boot() {
    if (reduce.matches) {
      setupReduced();
      return;
    }
    if (!window.gsap || !window.ScrollTrigger) return;
    setupMotion();
  }

  const fontsReady = document.fonts && document.fonts.ready
    ? document.fonts.ready
    : Promise.resolve();

  Promise.race([
    fontsReady,
    new Promise(function (resolve) { setTimeout(resolve, 1800); }),
  ]).then(boot);

  if (document.fonts && document.fonts.addEventListener) {
    document.fonts.addEventListener("loadingdone", function () {
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  reduce.addEventListener("change", function () {
    window.location.reload();
  });
})();
