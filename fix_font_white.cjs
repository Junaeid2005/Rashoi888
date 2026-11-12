const cp = require("child_process");
const fs = require("fs");

// Read current official logo
cp.execSync("/usr/bin/convert public/images/rashoi_official_logo.png -depth 8 /tmp/logo_cur.rgba");
const curBuf = fs.readFileSync("/tmp/logo_cur.rgba");

// Read original uploaded image
cp.execSync("/usr/bin/convert public/assets/aistudio/image_3837fccc.png -depth 8 /tmp/orig.rgba");
const origBuf = fs.readFileSync("/tmp/orig.rgba");

const W = 1032, H = 1032;
const origW = 1271, origH = 1238;
const cx_orig = 645, cy_orig = 626;

// Create output buffer for medallion
const outLogo = Buffer.alloc(curBuf.length);
curBuf.copy(outLogo);

// Create output buffer for transparent font logo (same WxH then trimmed)
const outFont = Buffer.alloc(curBuf.length);

// Generate font mask:
// Inside radius < 415:
// Any pixel in Chilli or Text region that was NOT plate in original image is FONT!
const isFont = new Uint8Array(W * H);

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const origX = x + (cx_orig - 516);
    const origY = y + (cy_orig - 516);
    if (origX < 0 || origX >= origW || origY < 0 || origY >= origH) continue;

    const dx = x - 516, dy = y - 516;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist >= 418) continue; // strictly inside inner medallion

    // Chilli bounds or Rashoi text bounds
    const inChilli = (x >= 420 && x <= 820 && y >= 105 && y <= 430);
    const inText = (x >= 120 && x <= 930 && y >= 320 && y <= 770);

    if (!inChilli && !inText) continue;

    const origIdx = (origY * origW + origX) * 4;
    const or = origBuf[origIdx];
    const og = origBuf[origIdx+1];
    const ob = origBuf[origIdx+2];

    // In original image: plate is (or > 40 && og < 18 && ob < 30 && (or - ob) > 22)
    const isOrigPlate = (or > 40 && og < 18 && ob < 30 && (or - ob) > 22);

    if (!isOrigPlate) {
      isFont[y * W + x] = 1;
    }
  }
}

// Check connected components / close small 1px gaps inside font strokes:
// Morphological closing (dilate then erode) of isFont to make the font interior 100% solid white
const dilated = new Uint8Array(W * H);
for (let y = 1; y < H - 1; y++) {
  for (let x = 1; x < W - 1; x++) {
    const idx = y * W + x;
    if (isFont[idx]) {
      dilated[idx] = 1;
    } else {
      // If 5 or more neighbors are font, fill it
      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (isFont[(y + dy) * W + (x + dx)]) count++;
        }
      }
      if (count >= 5) {
        dilated[idx] = 1;
      }
    }
  }
}

let fontPixelsFilled = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const idx = (y * W + x) * 4;
    if (dilated[y * W + x]) {
      // Pure white #FFFFFF for the entire font!
      outLogo[idx] = 255;
      outLogo[idx+1] = 255;
      outLogo[idx+2] = 255;
      outLogo[idx+3] = 255;

      // Transparent font version
      outFont[idx] = 255;
      outFont[idx+1] = 255;
      outFont[idx+2] = 255;
      outFont[idx+3] = 255;

      fontPixelsFilled++;
    }
  }
}

console.log("Total font pixels filled with pure white:", fontPixelsFilled);

fs.writeFileSync("/tmp/out_logo.rgba", outLogo);
fs.writeFileSync("/tmp/out_font.rgba", outFont);

// Convert to PNG with smooth anti-aliasing
cp.execSync("/usr/bin/convert -size 1032x1032 -depth 8 /tmp/out_logo.rgba public/images/rashoi_official_logo.png");
cp.execSync("/usr/bin/convert -size 1032x1032 -depth 8 /tmp/out_font.rgba -trim +repage public/images/rashoi_font_logo_transparent.png");

// Apply smooth edge anti-aliasing to rashoi_font_logo_transparent.png
cp.execSync("/usr/bin/convert public/images/rashoi_font_logo_transparent.png \\( +clone -alpha extract -blur 0x0.8 -level 10%,90% \\) -alpha off -compose CopyOpacity -composite public/images/rashoi_font_logo_transparent.png");

// Copy to all aliases
cp.execSync("cp public/images/rashoi_official_logo.png public/images/rashoi_logo_ruby_circle.png");
cp.execSync("cp public/images/rashoi_official_logo.png public/images/rashoi_logo_emblem.png");
cp.execSync("cp public/images/rashoi_official_logo.png public/images/rashoi_logo_transparent.png");
cp.execSync("cp public/images/rashoi_font_logo_transparent.png public/images/rashoi_font_logo.png");
cp.execSync("cp public/images/rashoi_font_logo_transparent.png public/images/rashoi_wordmark.png");

console.log("Updated all official logo files successfully!");

fs.unlinkSync("/tmp/logo_cur.rgba");
fs.unlinkSync("/tmp/orig.rgba");
fs.unlinkSync("/tmp/out_logo.rgba");
fs.unlinkSync("/tmp/out_font.rgba");
