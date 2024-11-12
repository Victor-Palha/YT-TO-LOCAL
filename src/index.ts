import readline from 'node:readline';
import { formatOptions, ytDownload } from './config/yt';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`URL from YouTube Video: `, (url) => {
  rl.question(`Choose the format: \n1. Video\n2. Audio\n`, (format) => {
    let selectedFormat = formatOptions.VIDEO;
    if (format === "2") {
      selectedFormat = formatOptions.AUDIO;
    }

    console.log(`URL: ${url}`);
    console.log(`Selected Format: ${selectedFormat}`);
    console.log(`Trying to connect...`);

    ytDownload({
      url,
      options: { format: selectedFormat }
    })
      .then(({ path, url }) => {
        console.log(`Downloaded and saved at: ${path}`);
        console.log(`URL: ${url}`);
      })
      .catch(err => {
        console.error('The download failed...');
        console.error(err);
      })
      .finally(() => {
        rl.close();
      });
  });
});
