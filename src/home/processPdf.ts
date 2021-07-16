import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const processPdf = async (pdfFile: File, imageFile: File, userName: String, removePr: boolean) => {
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

        if (imageFile) {
            // draw user image
            const embedMethod = (imageFile.name.split('.').pop() === "png" ? pdfDoc.embedPng : pdfDoc.embedJpg).bind(pdfDoc);
            const imageData = await imageFile.arrayBuffer();
            const imageForPdf = await embedMethod(imageData);
            const jpgDims = imageForPdf.scale(1);
            const aspectRatio = jpgDims.height / jpgDims.width;
            page.drawImage(imageForPdf, {
                x: 35,
                y: 144,
                width: 100,
                height: 100 * aspectRatio,
            });
        }

        // hide original name
        page.drawRectangle({
            x: 145,
            y: 150,
            width: 190,
            height: 25,
            color: rgb(.91, .93, .94),
            // borderColor: rgb(1, 0, 0),
            // borderWidth: 2
        });

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
