/* =========================================================================
   png.js - read and write PNG files with no dependencies
   =========================================================================
   Node already ships zlib, which is the only hard part of PNG, so this needs
   no "npm install" - matching the rest of the project, where nothing has to be
   installed to work.

   Reading  : handles the PNG flavours real art tools emit - RGBA, RGB,
              greyscale, greyscale+alpha, and indexed/palette (1/2/4/8 bit),
              with or without transparency. 16-bit is down-sampled to 8.
   Writing  : always 8-bit RGBA, which every browser and Phaser reads happily.

   Everything is handled as a flat Uint8Array of RGBA bytes: 4 per pixel,
   left-to-right, top-to-bottom.
   ========================================================================= */

var zlib = require('zlib');

var SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/* --- CRC32, which PNG puts at the end of every chunk ---------------------- */

var CRC_TABLE = (function () {
  var table = new Int32Array(256);
  var n;
  var c;
  var k;

  for (n = 0; n < 256; n++) {
    c = n;
    for (k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }

  return table;
})();

function crc32(buffer) {
  var c = 0xffffffff;
  var i;

  for (i = 0; i < buffer.length; i++) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }

  return (c ^ 0xffffffff) >>> 0;
}

/* --- undo the per-scanline filter PNG applies ---------------------------- */

function paeth(a, b, c) {
  var p = a + b - c;
  var pa = Math.abs(p - a);
  var pb = Math.abs(p - b);
  var pc = Math.abs(p - c);

  if (pa <= pb && pa <= pc) { return a; }
  if (pb <= pc) { return b; }
  return c;
}

function unfilter(raw, height, bytesPerRow, bytesPerPixel) {
  var out = Buffer.alloc(height * bytesPerRow);
  var pos = 0;
  var y;
  var x;
  var filter;
  var rowStart;
  var prevStart;
  var left;
  var up;
  var upLeft;
  var value;

  for (y = 0; y < height; y++) {
    filter = raw[pos];
    pos += 1;

    rowStart = y * bytesPerRow;
    prevStart = rowStart - bytesPerRow;

    for (x = 0; x < bytesPerRow; x++) {
      value = raw[pos + x];

      left = (x >= bytesPerPixel) ? out[rowStart + x - bytesPerPixel] : 0;
      up = (y > 0) ? out[prevStart + x] : 0;
      upLeft = (y > 0 && x >= bytesPerPixel) ? out[prevStart + x - bytesPerPixel] : 0;

      if (filter === 0) {
        out[rowStart + x] = value;
      } else if (filter === 1) {
        out[rowStart + x] = (value + left) & 0xff;
      } else if (filter === 2) {
        out[rowStart + x] = (value + up) & 0xff;
      } else if (filter === 3) {
        out[rowStart + x] = (value + ((left + up) >> 1)) & 0xff;
      } else if (filter === 4) {
        out[rowStart + x] = (value + paeth(left, up, upLeft)) & 0xff;
      } else {
        throw new Error('Unknown PNG row filter: ' + filter);
      }
    }

    pos += bytesPerRow;
  }

  return out;
}

/* --- pull out one sample when the bit depth is less than 8 (palette PNGs) - */

function readBits(row, index, depth) {
  var perByte = 8 / depth;
  var byte = row[Math.floor(index / perByte)];
  var shift = 8 - depth * ((index % perByte) + 1);

  return (byte >> shift) & ((1 << depth) - 1);
}

/* -------------------------------------------------------------------------
   decode(buffer) -> { width, height, rgba }
   ------------------------------------------------------------------------- */
function decode(buffer) {
  var i;

  for (i = 0; i < SIGNATURE.length; i++) {
    if (buffer[i] !== SIGNATURE[i]) {
      throw new Error('Not a PNG file (bad signature).');
    }
  }

  var pos = 8;
  var idat = [];
  var palette = null;
  var alphaChunk = null;
  var header = null;

  var length;
  var type;

  while (pos < buffer.length) {
    length = buffer.readUInt32BE(pos);
    type = buffer.toString('ascii', pos + 4, pos + 8);

    var data = buffer.subarray(pos + 8, pos + 8 + length);

    if (type === 'IHDR') {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12]
      };
    } else if (type === 'PLTE') {
      palette = data;
    } else if (type === 'tRNS') {
      alphaChunk = data;
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }

    pos += 12 + length;
  }

  if (!header) {
    throw new Error('PNG has no IHDR chunk.');
  }

  if (header.interlace !== 0) {
    throw new Error(
      'This PNG is interlaced, which this tool does not read.\n' +
      '  Fix: re-export it without interlacing ("Progressive" off).'
    );
  }

  var samplesPerPixel = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[header.colorType];

  if (samplesPerPixel === undefined) {
    throw new Error('Unsupported PNG colour type: ' + header.colorType);
  }

  var bitsPerPixel = samplesPerPixel * header.bitDepth;
  var bytesPerRow = Math.ceil((bitsPerPixel * header.width) / 8);
  var bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8));

  var inflated = zlib.inflateSync(Buffer.concat(idat));
  var pixels = unfilter(inflated, header.height, bytesPerRow, bytesPerPixel);

  // Now turn whatever flavour it was into plain RGBA.
  var rgba = new Uint8Array(header.width * header.height * 4);
  var step = header.bitDepth === 16 ? 2 : 1;   // 16-bit: keep the high byte
  var x;
  var y;
  var row;
  var out;
  var r;
  var g;
  var b;
  var a;
  var index;

  for (y = 0; y < header.height; y++) {
    row = pixels.subarray(y * bytesPerRow, (y + 1) * bytesPerRow);

    for (x = 0; x < header.width; x++) {
      out = (y * header.width + x) * 4;

      if (header.colorType === 3) {
        index = (header.bitDepth < 8)
          ? readBits(row, x, header.bitDepth)
          : row[x];

        r = palette[index * 3];
        g = palette[index * 3 + 1];
        b = palette[index * 3 + 2];
        a = (alphaChunk && index < alphaChunk.length) ? alphaChunk[index] : 255;

      } else if (header.colorType === 0 || header.colorType === 4) {
        var gray = row[x * samplesPerPixel * step];
        r = gray;
        g = gray;
        b = gray;
        a = (header.colorType === 4) ? row[(x * samplesPerPixel + 1) * step] : 255;

      } else {
        var base = x * samplesPerPixel * step;
        r = row[base];
        g = row[base + step];
        b = row[base + 2 * step];
        a = (header.colorType === 6) ? row[base + 3 * step] : 255;
      }

      rgba[out] = r;
      rgba[out + 1] = g;
      rgba[out + 2] = b;
      rgba[out + 3] = a;
    }
  }

  // A greyscale or RGB image with a tRNS chunk marks ONE colour as see-through.
  if (alphaChunk && header.colorType !== 3) {
    applyColorKey(rgba, header, alphaChunk, step);
  }

  return { width: header.width, height: header.height, rgba: rgba };
}

function applyColorKey(rgba, header, alphaChunk, step) {
  var keyR;
  var keyG;
  var keyB;

  if (header.colorType === 0) {
    keyR = alphaChunk.readUInt16BE(0) & 0xff;
    keyG = keyR;
    keyB = keyR;
  } else {
    keyR = alphaChunk.readUInt16BE(0) & 0xff;
    keyG = alphaChunk.readUInt16BE(2) & 0xff;
    keyB = alphaChunk.readUInt16BE(4) & 0xff;
  }

  var i;

  for (i = 0; i < rgba.length; i += 4) {
    if (rgba[i] === keyR && rgba[i + 1] === keyG && rgba[i + 2] === keyB) {
      rgba[i + 3] = 0;
    }
  }
}

/* -------------------------------------------------------------------------
   encode({ width, height, rgba }) -> Buffer
   Always writes 8-bit RGBA with no row filtering. Simple and universal.
   ------------------------------------------------------------------------- */
function encode(image) {
  var bytesPerRow = image.width * 4;
  var raw = Buffer.alloc((bytesPerRow + 1) * image.height);
  var y;

  for (y = 0; y < image.height; y++) {
    raw[y * (bytesPerRow + 1)] = 0;   // filter 0 = none
    Buffer.from(
      image.rgba.buffer, image.rgba.byteOffset + y * bytesPerRow, bytesPerRow
    ).copy(raw, y * (bytesPerRow + 1) + 1);
  }

  var ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(image.width, 0);
  ihdr.writeUInt32BE(image.height, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type 6 = RGBA
  ihdr[10] = 0;   // deflate
  ihdr[11] = 0;   // adaptive filtering
  ihdr[12] = 0;   // no interlace

  return Buffer.concat([
    Buffer.from(SIGNATURE),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function chunk(type, data) {
  var length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  var typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);

  var crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);

  return Buffer.concat([length, typeAndData, crc]);
}

/* -------------------------------------------------------------------------
   Small helpers used by the packer.
   ------------------------------------------------------------------------- */

function blank(width, height) {
  return { width: width, height: height, rgba: new Uint8Array(width * height * 4) };
}

/* Copy one image into another at (dx, dy). */
function blit(dest, src, dx, dy) {
  var y;
  var x;
  var from;
  var to;

  for (y = 0; y < src.height; y++) {
    for (x = 0; x < src.width; x++) {
      from = (y * src.width + x) * 4;
      to = ((dy + y) * dest.width + (dx + x)) * 4;

      dest.rgba[to] = src.rgba[from];
      dest.rgba[to + 1] = src.rgba[from + 1];
      dest.rgba[to + 2] = src.rgba[from + 2];
      dest.rgba[to + 3] = src.rgba[from + 3];
    }
  }
}

/* Cut a rectangle out of an image. */
function crop(src, sx, sy, width, height) {
  var out = blank(width, height);
  var y;
  var x;
  var from;
  var to;

  for (y = 0; y < height; y++) {
    for (x = 0; x < width; x++) {
      from = ((sy + y) * src.width + (sx + x)) * 4;
      to = (y * width + x) * 4;

      out.rgba[to] = src.rgba[from];
      out.rgba[to + 1] = src.rgba[from + 1];
      out.rgba[to + 2] = src.rgba[from + 2];
      out.rgba[to + 3] = src.rgba[from + 3];
    }
  }

  return out;
}

/* The box that actually has something visible in it. null if fully clear. */
function opaqueBounds(image) {
  var minX = image.width;
  var minY = image.height;
  var maxX = -1;
  var maxY = -1;
  var x;
  var y;

  for (y = 0; y < image.height; y++) {
    for (x = 0; x < image.width; x++) {
      if (image.rgba[(y * image.width + x) * 4 + 3] !== 0) {
        if (x < minX) { minX = x; }
        if (y < minY) { minY = y; }
        if (x > maxX) { maxX = x; }
        if (y > maxY) { maxY = y; }
      }
    }
  }

  if (maxX < 0) {
    return null;
  }

  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

module.exports = {
  decode: decode,
  encode: encode,
  blank: blank,
  blit: blit,
  crop: crop,
  opaqueBounds: opaqueBounds
};
