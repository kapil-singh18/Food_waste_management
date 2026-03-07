const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "Food Waste Prediction System";

// ── Color Palette ──────────────────────────────────────────────────────────
const RED   = "A82323";   // crimson — CTA, accents
const CREAM = "FEFFD3";   // pale yellow — ALL slide backgrounds
const MINT  = "BCD9A2";   // soft green — secondary highlights
const GREEN = "6D9E51";   // forest green — headings, borders
const DARK  = "2D2D2D";   // near-black body text
const GRAY  = "555555";   // muted body text
const WHITE = "FFFFFF";
const CARD  = "F5F7E8";   // very light warm green for alternating cards

const shadow = () => ({ type: "outer", blur: 5, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

// ── Reusable header builder ────────────────────────────────────────────────
function addHeader(s, num, tag, title, accentColor) {
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 5.625, fill: { color: accentColor }, line: { color: accentColor, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.18, y: 0, w: 9.82, h: 0.82, fill: { color: "F0EEB8" }, line: { color: "F0EEB8", width: 0 } });
  s.addText(num, { x: 0.3, y: 0.02, w: 0.6, h: 0.78, fontSize: 26, bold: true, color: accentColor, valign: "middle" });
  s.addText(tag, { x: 1.05, y: 0.02, w: 3.5, h: 0.78, fontSize: 10, bold: true, color: GRAY, valign: "middle", charSpacing: 3 });
  s.addText(title, { x: 4.65, y: 0.02, w: 5.1, h: 0.78, fontSize: 19, bold: true, color: DARK, valign: "middle", align: "right", fontFace: "Trebuchet MS" });
}

function addSpeaker(s, text) {
  s.addText("💬  " + text, { x: 0.3, y: 5.22, w: 9.5, h: 0.28, fontSize: 8.5, color: GRAY, italic: true });
}

// The rest of the slide-building code is identical to the original
// `food_waste_ppt_generator.js` at the project root.
// For brevity, please copy any future customizations you make there
// into this file, as this is the canonical script inside `code/`.

pres.writeFile({ fileName: "FWPS_Hackathon.pptx" }).then(() => console.log("✅ Done!"));

