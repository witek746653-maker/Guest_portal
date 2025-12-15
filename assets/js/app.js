if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
fetch('./components/contact-modal.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('modal-root').innerHTML = html;
  });

