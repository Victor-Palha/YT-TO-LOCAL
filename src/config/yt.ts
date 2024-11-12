import youtubeDl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";

type YtConfig = {
    url: string;
    options: {
        format: formatOptions;
    }
};

export enum formatOptions {
    VIDEO = "mergeall",
    AUDIO = "bestaudio",
}

export async function ytDownload({ url, options }: YtConfig) {
    if (!url) {
        throw new Error("URL is required");
    }
    if (!options) {
        throw new Error("Options are required");
    }

    const outputDir = path.join(__dirname, "../downloads/");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const hashTitle = url.split("v=")[1];
    const outputPath = path.join(outputDir, `${hashTitle}.%(ext)s`);
    const finalOutputPath = path.join(outputDir, `${hashTitle}.mp4`);

    // Download using youtube-dl
    await youtubeDl(url, {
        format: options.format,
        noCheckCertificates: true,
        noWarnings: true,
        addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
        output: outputPath,
    });

    // Check if the downloaded file is in WebM format and convert to MP4 if necessary
    const webmPath = outputPath.replace("%(ext)s", "webm");

    if (fs.existsSync(webmPath)) {
        await new Promise((resolve, reject) => {
            ffmpeg(webmPath)
                .output(finalOutputPath)
                .on("end", () => {
                    console.log(`Converted to MP4: ${finalOutputPath}`);
                    resolve(true);
                })
                .on("error", (err) => {
                    console.error("Conversion to MP4 failed", err);
                    reject(err);
                })
                .run();
        });

        // Optionally delete the original WebM file after conversion
        fs.unlinkSync(webmPath);
    }

    return {
        path: fs.existsSync(finalOutputPath) ? finalOutputPath : webmPath,
        url,
    };
}
