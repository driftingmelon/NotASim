let t = 0;
let camSpeed = 0.01;

let doorPos, doorTarget;
let doorW = 80, doorH;
let floatingSymbols = [];
let symbols = ["∞", "1", "$","☽", "☾", "✦", "0", "ꨄ︎99+"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  rectMode(CENTER);
  noFill();
  doorH = height * 0.25;
  doorPos = createVector(width / 2, height * 0.05);
  doorTarget = doorPos.copy();
  textFont('monospace');
}

function draw() {
  background(0, 40);

  let halfW = width / 2;
  let boxW = halfW * 0.9;
  let boxH = height * 0.9;

  stroke(80);
  line(halfW, 0, halfW, height);

  drawModifiedGrid();

  push();
  translate(halfW / 2, height / 2);
  drawMobiusFirst(boxW * 0.8, boxH * 0.5);
  pop();

  push();
  translate(halfW + halfW / 2, height / 2);
  drawMobiusThird(boxW * 0.8, boxH * 0.5);
  pop();

  drawCenterDoor(halfW, height);
  drawFloatingSymbols();

  noStroke();
  fill(255, 80 + 50 * sin(t * 2));
  textAlign(CENTER, CENTER);
  textSize(16);
  text("The Ouroboros Drive — First / Third", width / 2, height - 30);

  t += camSpeed;
}

// ---- 网格 ----
function drawModifiedGrid() {
  push();
  stroke(140, 140, 140, 35);
  strokeWeight(1);

  let pulse = 1 + 0.05 * sin(t * 0.8);
  let offsetY = 10 * sin(t * 0.5);
  translate(width / 2, height / 2 + offsetY);
  scale(pulse);
  translate(-width / 2, -height / 2);

  let topRegion = height * 3 / 4.3;
  let spacing = max(40, width / 30);
  let vanishingX = width / 2 + sin(t * 0.5) * 30;
  let bottom = height * 1.3;
  let rows = Math.ceil((bottom - topRegion) / spacing) + 4;

  for (let y = 0; y <= topRegion; y += spacing) line(-width * 0.5, y, width * 1.5, y);
  for (let x = -width * 0.5; x <= width * 1.5; x += spacing) line(x, 0, x, topRegion);

  for (let i = 0; i <= rows; i++) {
    let y = topRegion + i * spacing;
    let t2 = map(i, 0, rows, 0, 1);
    let leftX = lerp(-width * 0.8, vanishingX, t2 * 0.9);
    let rightX = lerp(width * 1.8, vanishingX, t2 * 0.9);
    line(leftX, y, rightX, y);
  }

  let verticalCols = Math.ceil(width / spacing) * 3;
  for (let i = -Math.floor(verticalCols / 2); i <= Math.floor(verticalCols / 2); i++) {
    let startX = vanishingX + i * (spacing * 0.6);
    line(startX, bottom, lerp(startX, vanishingX, 0.95), topRegion);
  }

  pop();
}

// ---- 中心门 ----
function drawCenterDoor(midX, h) {
  push();
  let mouseVec = createVector(mouseX, mouseY);
  let distVec = p5.Vector.sub(doorPos, mouseVec);
  let maxDist = 250;
  if (distVec.mag() < maxDist) {
    let away = distVec.setMag(30);
    doorTarget = p5.Vector.add(createVector(midX, h * 0.05), away);
  } else {
    doorTarget = createVector(midX, h * 0.05);
  }

  doorPos.lerp(doorTarget, 0.08);

  let scalePulse = 1 + 0.07 * sin(t * 1.2);
  let moveY = 30 * sin(t * 0.7);
  let moveX = 50 * sin(t * 0.5);

  translate(doorPos.x + moveX, doorPos.y + moveY);
  scale(scalePulse);

  let ctx = drawingContext; 
  let radius = max(doorW, doorH) * 0.5;
  let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.06)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  noStroke();
  ellipse(0, 0, radius * 2);

  stroke(255);
  strokeWeight(2);
  noFill();
  rect(0, 0, doorW, doorH, 6);

  noStroke();
  fill(255);
  ellipse(doorW / 2 - 6, 0, 8);
  pop();
}

// ---- 发光粒子系统 ----
function drawFloatingSymbols() {
  for (let i = floatingSymbols.length - 1; i >= 0; i--) {
    let s = floatingSymbols[i];
    s.angle += s.speed;
    s.radius += 0.5;
    s.alpha -= 6;

    let sx = s.x + cos(s.angle) * s.radius;
    let sy = s.y + sin(s.angle) * s.radius - s.radius * 0.3;

    noStroke();
    fill(s.color.levels[0], s.color.levels[1], s.color.levels[2], s.alpha * 0.3);
    ellipse(sx - 4, sy, 6);
    ellipse(sx + 4, sy, 6);

    fill(s.color.levels[0], s.color.levels[1], s.color.levels[2], s.alpha);
    textSize(18);
    textAlign(CENTER, CENTER);
    text(s.char, sx, sy);

    if (s.alpha <= 0) floatingSymbols.splice(i, 1);
  }
}

function mousePressed() {
  for (let i = 0; i < 3; i++) { 
    let c = random(symbols);
    let col = color(random(180, 255), random(100, 255), random(180, 255));
    floatingSymbols.push({
      char: c,
      x: mouseX,
      y: mouseY,
      radius: random(10, 20),
      angle: random(TWO_PI),
      alpha: 220,
      speed: random(0.04, 0.08),
      color: col
    });
  }
}

// ---- 第一视角莫比乌斯 ----
function drawMobiusFirst(w, h) {
  let num = 300;
  let R = w / 3;
  let r = h / 4;

  beginShape();
  for (let i = 0; i < num; i++) {
    let u = map(i, 0, num, 0, TWO_PI);
    let dynamicR = R * (0.9 + 0.1 * sin(t * 0.3 + u * 2));
    let dynamicR2 = r * (0.5 + 0.5 * cos(u * 3 + t * 0.25));
    let smoothTwist = cos(u / 2 + t * 0.15) * 0.5 + 0.5;
    let smoothR = dynamicR2 * (0.5 + 0.5 * smoothTwist);
    let x = (dynamicR + smoothR * cos(u / 2)) * cos(u);
    let y = (dynamicR + smoothR * sin(u / 2)) * cos(u);
    let z = smoothR * sin(u / 2);
    let px = x * cos(t * 0.7) - z * sin(t * 0.7);
    let py = y;
    stroke(150 + 80 * sin(u * 3 + t * 2), 180 + 50 * sin(t), 255, 220);
    vertex(px * 0.7, py * 0.7);
  }
  endShape(CLOSE);

  let cx = (R + r * cos(t / 2)) * cos(t);
  let cy = (R + r * cos(t / 2)) * sin(t);
  let px = cx * 0.7;
  let py = cy * 0.7;
  noStroke();
  for (let i = 6; i >= 1; i--) {
    fill(120, 180, 255, 25 / i);
    ellipse(px, py, i * 5);
  }
  fill(255);
  ellipse(px, py, 8);
}

// ---- 第三视角莫比乌斯 ----
function drawMobiusThird(w, h) {
  let num = 400;
  let R = w / 3;
  let r = h / 4;

  strokeWeight(1);
  noFill();
  let rotateY = sin(t * 0.3) * PI / 8;
  let rotateX = cos(t * 0.25) * PI / 10;

  for (let v = -1; v <= 1; v += 0.1) {
    beginShape();
    for (let i = 0; i < num; i++) {
      let u = map(i, 0, num, 0, TWO_PI);
      let x = (R + v * r * cos(u / 2)) * cos(u);
      let y = (R + v * r * cos(u / 2)) * sin(u);
      let z = v * r * sin(u / 2);

      let x1 = x * cos(rotateY) - z * sin(rotateY);
      let z1 = x * sin(rotateY) + z * cos(rotateY);
      let y1 = y * cos(rotateX) - z1 * sin(rotateX);

      let px = x1 * cos(PI / 6) - z1 * sin(PI / 6);
      let py = y1;

      stroke(120 + 100 * sin(u * 2 + v + t), 140 + 60 * v, 255, 150);
      vertex(px, py);
    }
    endShape();
  }

  let u = t % TWO_PI;
  let x = (R + r * cos(u / 2)) * cos(u);
  let y = (R + r * cos(u / 2)) * sin(u);
  let z = r * sin(u / 2);

  let x1 = x * cos(rotateY) - z * sin(rotateY);
  let z1 = x * sin(rotateY) + z * cos(rotateY);
  let y1 = y * cos(rotateX) - z1 * sin(rotateX);

  let px = x1 * cos(PI / 6) - z1 * sin(PI / 6);
  let py = y1;

  let fadeDuration = PI / 2;
  let fadeFactor = 1.0;
  if (u < fadeDuration) fadeFactor = sin(map(u, 0, fadeDuration, 0, HALF_PI));
  else if (u > TWO_PI - fadeDuration) fadeFactor = sin(map(u, TWO_PI - fadeDuration, TWO_PI, HALF_PI, 0));

  let size = 1 + 8 * fadeFactor;
  let alpha = 120 + 120 * fadeFactor;

  noStroke();
  for (let i = 6; i >= 1; i--) {
    fill(150 + x / 3, 170 + y / 5, 220 + y / 4, alpha / (i * 5));
    ellipse(px, py, size + i * 5);
  }

  fill(230, 245, 255, alpha);
  ellipse(px, py, size);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
