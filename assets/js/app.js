if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then((reg) => {
    if (reg.waiting) showUpdateBanner(reg);

    reg.addEventListener("updatefound", () => {
      const nw = reg.installing;
      if (!nw) return;

      nw.addEventListener("statechange", () => {
        if (nw.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner(reg);
        }
      });
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

function showUpdateBanner(reg) {
  if (document.getElementById("update-banner")) return;

  const banner = document.createElement("div");
  banner.id = "update-banner";
  banner.innerHTML = `
    <div class="update-banner__text">Доступно обновление</div>
    <button class="update-banner__btn" type="button">Обновить</button>
  `;

  banner.querySelector(".update-banner__btn").addEventListener("click", () => {
    if (reg.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
  });

  document.body.appendChild(banner);
}

// ваш код модалки — оставляйте как есть
fetch("./components/contact-modal.html")
  .then((res) => res.text())
  .then((html) => {
    const root = document.getElementById("modal-root");
    if (root) root.innerHTML = html;
  });


