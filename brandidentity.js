let video;
let x;
let y;
let imgs;
let tran;
let vScale = 7;
let threshold = 5;
let pixelArray;
let z = false;
let clrs;



function setup() {

  imgs = [
    ["imgs/1.jpg", 255, 255, 255],
    ["imgs/2.jpg", 214, 77, 70],
    ["imgs/3.jpg", 12, 110, 67],
    ["imgs/5.jpg", 5, 5, 5],
    ["imgs/6.jpg", 217, 25, 48],
    ["imgs/7.jpg", 253, 187, 47],
    // ["imgs/8.jpg", 164, 202, 57],
    ["imgs/9.jpg", 186, 56, 51],
    ["imgs/10.jpg", 229, 228, 210],
  ];

  for (let i = 0; i < imgs.length; i++) {
    imgs[i] = new Logo(imgs[i][0], imgs[i][1], imgs[i][2], imgs[i][3]);
  }

  // get stream resolution
  let video = document.createElement("video");
  navigator.mediaDevices
    .getUserMedia({
      video: true,
    })
    .then((stream) => {
      video.srcObject = stream;
      video.onloadedmetadata = function () {
        if (windowWidth < this.videoWidth) {
          respwidth = windowWidth;
          respheight = this.videoHeight - (this.videoWidth - windowWidth);
        } else {
          respwidth = this.videoWidth;
          respheight = this.videoHeight;
        }

        c = createCanvas(respwidth, respheight);
        c.position(
          (windowWidth - c.width) / 2,
          (windowHeight - c.height + 35) / 2
        );
        c.parent("canvasWrapper");
      };
    });

}

function draw() {

  x = width;
  y = height;
  frameRate(24);
  background(255);

  if (x > 100 && z == false) {
    video = createCapture(VIDEO);
    video.size(x / vScale, y / vScale);
    pixelArray = primePixelArray(video.height, video.width);
    video.hide();
    z = true;
  }

  // translate according to even or odd resolution
  if (x % 2 == 0) {
    tran = 2;
  } else {
    tran = 3;
  }
  translate(tran, tran);

  //preprocess contrast of videofeed
  if (x > 100 && z == true) {
    video.loadPixels();

    for (let y = 0; y < video.height; y++) {
      for (let x = 0; x < video.width; x++) {
        let index = (video.width - x - 1 + y * video.width) * 4;
        let arrIndex = (video.width - x - 1 + y * video.width);
        let r = video.pixels[index];
        let g = video.pixels[index + 1];
        let b = video.pixels[index + 2];
        let bright = (r + g + b) / 3;
        let img = closestClr(r,g,b,bright,arrIndex);

        image(img, round(x * vScale), y * vScale, vScale, vScale);

      }
    }

  }
}

function distance(r1, g1, b1, bright1, r2, g2, b2, bright2) {

  d = sqrt(
    ((r2 - r1) * 0.3) ** 2 +
      ((g2 - g1) * 0.59) ** 2 +
      ((b2 - b1) * 0.11) ** 2 +
      ((bright2 - bright1) * 0.75) ** 2
  );
  return Math.round(d);

}

function closestClr(r,g,b,a,arrIdx) {
  let currentImg = pixelArray[arrIdx];
  let least = Infinity;
  let place;


  for (let i = 0; i < imgs.length; i++) {
    let currentDistance = distance(imgs[i].r, imgs[i].g, imgs[i].b,imgs[i].bright,r,g,b,a);
    if (currentDistance < least) {
      least = currentDistance;
      place = imgs[i];
    }
  }

  if ((least + threshold) < distance(currentImg.r, currentImg.g, currentImg.b,currentImg.bright,r,g,b,a)) {
    pixelArray[arrIdx] = place;
    return place.img;
  } else return pixelArray[arrIdx].img;
  
}

class Logo {
  constructor(imgpath, r, g, b) {
    this.img = loadImage(imgpath);
    this.r = r;
    this.g = g;
    this.b = b;
    this.bright = (this.r + this.g + this.b) / 3;
  }
}

function primePixelArray(videoHeight, videoWidth) {
  let pixelArray = [];

  for (let y = 0; y < videoHeight; y++) {
    for (let x = 0; x < videoWidth; x++) {

      pixelArray.push(imgs[0]);

    }
  }

  return pixelArray;
}

function windowResized() {
  c.position((windowWidth - c.width) / 2, (windowHeight - c.height + 35) / 2);
}

