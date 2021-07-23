import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const processPdf = async (pdfFile: File, imageFile: File, userName: String, removePr: boolean, imageRotation: number) => {
    if (!pdfFile) return "";
    const data = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(data);
    const page = pdfDoc.getPages()[0];

    if (removePr) {
        // hide original image.
        page.drawRectangle({
            x: 35,
            y: 145,
            width: 100,
            height: 100,
            color: rgb(.91, .93, .94)
        });

        // hide original name
        page.drawRectangle({
            x: 145,
            y: 150,
            width: 190,
            height: 25,
            color: rgb(.91, .93, .94),
        });

        if (imageFile) {
            // draw user image
            const embedMethod = (imageFile.name.split('.').pop() === "png" ? pdfDoc.embedPng : pdfDoc.embedJpg).bind(pdfDoc);
            const imageData = await imageFile.arrayBuffer();
            const imageForPdf = await embedMethod(imageData);
            const jpgDims = imageForPdf.scale(1);
            const aspectRatio = jpgDims.height / jpgDims.width;
            const imageOptions = {
                x: 35,
                y: 144,
                width: 100,
                height: Math.round(100 * aspectRatio),
                rotate: degrees(imageRotation)
            }
            if (jpgDims.width > jpgDims.height) {
                imageOptions.height = 100; 
                imageOptions.width = Math.round(100 / aspectRatio)
            }
            if (imageRotation === 90) {
                imageOptions.x += imageOptions.height;
            } else if (imageRotation === 180) {
                imageOptions.x += imageOptions.width;
                imageOptions.y += imageOptions.height;
            } else if (imageRotation === 270) {
                imageOptions.y += imageOptions.width;
            }

            page.drawImage(imageForPdf, imageOptions);
        }

        if (userName) {
            // draw user name
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
            page.drawText(`- ${userName}`, {
                x: 150,
                y: 160,
                font: helveticaFont,
                size: 12,
                color: rgb(0, 0, 0),
                lineHeight: 24,
                opacity: 0.75,
            })
        }
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    return URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' }));
}
