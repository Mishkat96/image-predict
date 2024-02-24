import * as tf from '@tensorflow/tfjs-node';
import cocoSsd from '@tensorflow-models/coco-ssd';
import fs from 'fs';
import express from 'express';
import path from 'path';

const port = 8002;
const app = express();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname))); 

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const headCounts = [];

const folderIndices = {}; 

let totalCount = 0; 

async function processImagesFromFolders() {
  const folders = ['cam1', 'cam2'];

  for (const folder of folders) {
    if (!folderIndices[folder]) {
      folderIndices[folder] = 0;
    }

    const folderPath = path.join(__dirname, folder);
    const files = fs.readdirSync(folderPath).filter(file => path.extname(file) !== '.DS_Store'); // Filter out .DS_Store files

    const fileIndex = folderIndices[folder];
    if (fileIndex < files.length) {
      const file = files[fileIndex];

      //Update folderIndices before processing the image
      folderIndices[folder]++;

      const imagePath = path.join(folderPath, file);
      const count = await countHeads(imagePath);

      //Update total count
      totalCount += count;

      // Store head count data
      const imageData = {
        imageId: `${folder}_${file}`,
        count,
        imagePath: `/images/${folder}/${file}`,
        totalCount,
        timestamp: new Date().toISOString()
      };
      headCounts.push(imageData);

      console.log(`Counted [${imageData.count}] heads in [${imageData.imageId}]. Total count: ${totalCount}`);
    }
  }
}



//Process images from folders every 30 seconds
setInterval(processImagesFromFolders, 7000); 

app.get('/image-predict/cam1', async (req, res) => {
  const cam1Data = headCounts.filter(data => data.imageId.startsWith('cam1_'));
  res.json(cam1Data);
});

app.get('/image-predict/cam2', async (req, res) => {
  const cam2Data = headCounts.filter(data => data.imageId.startsWith('cam2_'));
  res.json(cam2Data);
});

app.listen(port, () => {
  console.log(`Head counting server running on port ${port}`);
});

async function countHeads(filepath) {
  try {
    const imageBuffer = loadImageFromDisk(filepath);
    const tensorImage = tf.node.decodeImage(imageBuffer);
    const model = await cocoSsd.load();
    const predictions = await model.detect(tensorImage);
    const count = predictions.filter((pred) => pred.class === 'person').length;
    return count;
  } catch (error) {
    console.error(`Error processing image ${filepath}:`, error);
    return 0; // Will return 0 for unsupported images
  }
}


function loadImageFromDisk(filepath) {
  return fs.readFileSync(filepath);
}
