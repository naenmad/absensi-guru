const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9'; // 13.33 x 7.5 inches

const slide = pres.addSlide();
slide.background = { color: 'FFFFFF' };

// --- Header ---
slide.addText(
  [
    { text: 'Process Flow Warranty Rusty ', options: { bold: true, color: '0F172A' } },
    { text: '(Export Pass)', options: { bold: true, color: '059669' } }
  ],
  {
    x: 0.6,
    y: 0.45,
    w: 8.0,
    h: 0.45,
    fontSize: 20,
    fontFace: 'Arial'
  }
);

slide.addText('Standardized inspection sequence from incoming production material to final export delivery.', {
  x: 0.6,
  y: 0.95,
  w: 8.0,
  h: 0.3,
  fontSize: 10,
  color: '64748B',
  fontFace: 'Arial'
});

// --- Legend (Top Right) ---
// Green legend rect
slide.addShape(pres.ShapeType.roundRect, {
  x: 9.3,
  y: 0.6,
  w: 0.22,
  h: 0.18,
  fill: { color: 'F0FDF4' },
  line: { color: '16A34A', width: 1.5 },
  rectRadius: 0.05
});
slide.addText('Process / Assembly', {
  x: 9.58,
  y: 0.55,
  w: 1.3,
  h: 0.28,
  fontSize: 9,
  color: '475569',
  bold: true,
  fontFace: 'Arial'
});

// Blue legend diamond
slide.addShape(pres.ShapeType.diamond, {
  x: 11.0,
  y: 0.59,
  w: 0.19,
  h: 0.19,
  fill: { color: 'DBEAFE' },
  line: { color: '2563EB', width: 1.5 }
});
slide.addText('Inspection (Check)', {
  x: 11.25,
  y: 0.55,
  w: 1.4,
  h: 0.28,
  fontSize: 9,
  color: '475569',
  bold: true,
  fontFace: 'Arial'
});

// Divider line
slide.addShape(pres.ShapeType.line, {
  x: 0.6,
  y: 1.35,
  w: 12.13,
  h: 0,
  line: { color: 'E2E8F0', width: 1 }
});

// --- 11 Steps Data ---
const steps = [
  {
    type: 'green',
    name: 'INCOMING',
    bullets: ['F/G part must have date production identify on surface']
  },
  {
    type: 'blue',
    name: 'PPIC',
    bullets: ['FI/FO', 'Identity pass export', 'Packing standard']
  },
  {
    type: 'green',
    name: 'SUB ASSY',
    bullets: ['Check past disty']
  },
  {
    type: 'green',
    name: 'MAIN ASSY',
    bullets: ['Standard assembly check']
  },
  {
    type: 'blue',
    name: 'CHECK MAN',
    bullets: ['Apply anti rust', 'Check spatter']
  },
  {
    type: 'blue',
    name: 'FINAL CHECK',
    bullets: ['Appearance & anti rust', 'Spatter & dimension']
  },
  {
    type: 'blue',
    name: 'DOLLY',
    bullets: ['Anti rust & pallet', 'Qty verification']
  },
  {
    type: 'blue',
    name: 'GATE IN DPC',
    bullets: ['Anti rust & pallet std', 'Qty check']
  },
  {
    type: 'green',
    name: 'WH F/G',
    bullets: ['Storage environment control']
  },
  {
    type: 'blue',
    name: 'PDI',
    bullets: ['Anti rust & FI/FO', 'Pallet & rusty check']
  },
  {
    type: 'green',
    name: 'DELIVERY',
    bullets: ['Export shipping & container loading to customer']
  }
];

// Layout calculations
const totalSteps = steps.length; // 11
const colWidth = 0.94;
const shapeSize = 0.88;
const arrowWidth = 0.16;
const totalRowWidth = totalSteps * colWidth + (totalSteps - 1) * arrowWidth; // 11 * 0.94 + 10 * 0.16 = 10.34 + 1.6 = 11.94 in
const startX = (13.33 - totalRowWidth) / 2; // Perfectly centered on slide

const shapeY = 1.95;
const cardY = 3.05;
const cardHeight = 3.65;

// Background box for entire flowchart canvas
slide.addShape(pres.ShapeType.roundRect, {
  x: startX - 0.25,
  y: 1.65,
  w: totalRowWidth + 0.5,
  h: 5.3,
  fill: { color: 'FBFCFE' },
  line: { color: 'E2E8F0', width: 1 },
  rectRadius: 0.1
});

steps.forEach((step, idx) => {
  const currentX = startX + idx * (colWidth + arrowWidth);

  // Shape position (centered within column)
  const currentShapeX = currentX + (colWidth - shapeSize) / 2;

  if (step.type === 'green') {
    // Green rounded rectangle shape
    slide.addShape(pres.ShapeType.roundRect, {
      x: currentShapeX,
      y: shapeY,
      w: shapeSize,
      h: shapeSize,
      fill: { color: 'F0FDF4' },
      line: { color: '16A34A', width: 2 },
      rectRadius: 0.1
    });

    // Step Name inside shape
    slide.addText(step.name, {
      x: currentShapeX,
      y: shapeY,
      w: shapeSize,
      h: shapeSize,
      align: 'center',
      valign: 'middle',
      fontSize: 8.5,
      bold: true,
      color: '15803D',
      fontFace: 'Arial'
    });

    // Connector stem
    slide.addShape(pres.ShapeType.line, {
      x: currentX + colWidth / 2,
      y: shapeY + shapeSize,
      w: 0,
      h: cardY - (shapeY + shapeSize),
      line: { color: '86EFAC', width: 1.5 }
    });

    // Description Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: currentX,
      y: cardY,
      w: colWidth,
      h: cardHeight,
      fill: { color: 'F0FDF4' },
      line: { color: 'BBF7D0', width: 1 },
      rectRadius: 0.08
    });

    // Text in card
    slide.addText(step.bullets[0], {
      x: currentX + 0.05,
      y: cardY + 0.15,
      w: colWidth - 0.1,
      h: cardHeight - 0.3,
      align: 'center',
      valign: 'top',
      fontSize: 8,
      bold: true,
      color: '166534',
      fontFace: 'Arial'
    });
  } else {
    // Blue diamond shape
    slide.addShape(pres.ShapeType.diamond, {
      x: currentShapeX,
      y: shapeY,
      w: shapeSize,
      h: shapeSize,
      fill: { color: 'DBEAFE' },
      line: { color: '2563EB', width: 2 }
    });

    // Step Name inside shape
    slide.addText(step.name, {
      x: currentShapeX,
      y: shapeY,
      w: shapeSize,
      h: shapeSize,
      align: 'center',
      valign: 'middle',
      fontSize: 8.5,
      bold: true,
      color: '1E40AF',
      fontFace: 'Arial'
    });

    // Connector stem
    slide.addShape(pres.ShapeType.line, {
      x: currentX + colWidth / 2,
      y: shapeY + shapeSize,
      w: 0,
      h: cardY - (shapeY + shapeSize),
      line: { color: '93C5FD', width: 1.5 }
    });

    // Description Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: currentX,
      y: cardY,
      w: colWidth,
      h: cardHeight,
      fill: { color: 'EFF6FF' },
      line: { color: 'BFDBFE', width: 1 },
      rectRadius: 0.08
    });

    // Bullets in card
    const bulletItems = step.bullets.map(b => ({
      text: b,
      options: {
        bullet: { type: 'bullet', code: '2022' },
        fontSize: 7.8,
        color: '1E3A8A',
        bold: true,
        fontFace: 'Arial'
      }
    }));

    slide.addText(bulletItems, {
      x: currentX + 0.04,
      y: cardY + 0.15,
      w: colWidth - 0.08,
      h: cardHeight - 0.3,
      align: 'left',
      valign: 'top',
      lineSpacing: 16
    });
  }

  // Connecting Arrow between steps (if not the last step)
  if (idx < totalSteps - 1) {
    const arrowX = currentX + colWidth;
    const arrowY = shapeY + shapeSize / 2 - 0.05;

    slide.addShape(pres.ShapeType.rightArrow, {
      x: arrowX + 0.02,
      y: arrowY,
      w: arrowWidth - 0.04,
      h: 0.1,
      fill: { color: '94A3B8' },
      line: { color: '64748B', width: 0.5 }
    });
  }
});

pres.writeFile({ fileName: '/Users/mac/Developer/absensi-guru/Process_Flow_Warranty_Rusty.pptx' })
  .then(fileName => {
    console.log(`PPTX created successfully: ${fileName}`);
  })
  .catch(err => {
    console.error('Error generating PPTX:', err);
    process.exit(1);
  });
