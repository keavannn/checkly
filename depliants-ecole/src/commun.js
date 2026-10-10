(function () {
  // Typographie française : apostrophe courbe et espaces insécables.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    node.nodeValue = node.nodeValue
      .replace(/'/g, "’")
      .replace(/ :/g, " :")
      .replace(/ ([;!?»])/g, " $1")
      .replace(/« /g, "« ");
  }

  // Aperçu d'une seule face : ?face=1 (extérieur) ou ?face=2 (intérieur).
  const face = new URLSearchParams(location.search).get("face");
  if (face) {
    document.querySelectorAll(".sheet").forEach((s, i) => {
      if (String(i + 1) !== face) s.style.display = "none";
    });
  }

  // Signale les volets dont le contenu déborde.
  document.fonts.ready.then(() => {
    const out = [];
    document.querySelectorAll(".panel").forEach((p, i) => {
      const extra = p.scrollHeight - p.clientHeight;
      if (extra > 1) {
        p.classList.add("overflow");
        out.push(i + 1 + ":" + extra + "px");
      }
    });
    document.body.dataset.overflow = out.join(",") || "none";
  });
})();
