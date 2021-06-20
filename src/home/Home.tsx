import { BaseSyntheticEvent, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import './Home.css';

export const HomeComponent = () => {
    const [pdfFile, setPdfFile] = useState<any>(undefined);
    const [certificateFileName, setCertificateFileName] = useState("");

    const [imageFile, setImageFile] = useState<any>(undefined);
    const [imageFileName, setImageFileName] = useState("");

    const [userName, setUserName] = useState("");

    const [outputSettings, setOutputSettings] = useState<OutputSettings>({
        removeExistingImage: true,
        removeExistingName: true,
        replaceWithUserImage: false,
        replaceWithUserName: false
    });

    const [base64PDF, setBase64PDF] = useState<any>(undefined);

    const handleFileUpload = (e: BaseSyntheticEvent) => {
        const file = e.target.files[0];
        if (!file) return;
        switch (e.target.name) {
            case "picture":
                setImageFileName(file.name)
                setImageFile(file);
                break;
            case "certificate-pdf":
                setCertificateFileName(file.name);
                setPdfFile(file);
                break;
        }
    }

    const handleCheckboxChange = (e: any) => {
        setOutputSettings({
            ...outputSettings,
            ...{ [e.target.name]: e.target.checked }
        })
    }

    const handleUserNameChange = (e: any) => {
        setUserName(e.target.value);
    }

    const processPdf = async () => {
        const data = await (pdfFile as File).arrayBuffer();
        const pdfDoc = await PDFDocument.load(data);
        const page = pdfDoc.getPages()[0];

        if (outputSettings.removeExistingImage) {
            // hide original image.
            page.drawRectangle({
                x: 35,
                y: 145,
                width: 100,
                height: 100,
                color: rgb(.91, .93, .94)
            });

            if (outputSettings.replaceWithUserImage) {
                // draw user image
                const img = (imageFile as File);
                const embedMethod = (img.name.split('.').pop() === "png" ? pdfDoc.embedPng : pdfDoc.embedJpg).bind(pdfDoc);
                const imageData = await img.arrayBuffer();
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
        }

        if (outputSettings.removeExistingName) {
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

            if (outputSettings.replaceWithUserName) {
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

        const pdfBytes = await pdfDoc.save();
        setBase64PDF(URL.createObjectURL(new Blob([pdfBytes], { type: 'application/pdf' })));
    }

    const generatePdfEnabled = () => {
        const { removeExistingImage, removeExistingName, replaceWithUserImage, replaceWithUserName } = outputSettings;
        const isPrFree = removeExistingImage && removeExistingName;
        const nameIsReplacable = !replaceWithUserName || (replaceWithUserName && userName.length > 0);
        const imageIsReplacable = !replaceWithUserImage || (replaceWithUserImage && !!imageFile);
        return isPrFree && nameIsReplacable && imageIsReplacable;
    }

    return (
        <div className="container">
            {
                !base64PDF &&
                <section className="user-input">
                    <div className="file-upload-block">
                        <label htmlFor="certificate-pdf" className="btn">Upload Certificate</label>
                        <input type="file" id="certificate-pdf" name="certificate-pdf" accept="application/pdf"
                            onChange={handleFileUpload}></input>

                        <div>{certificateFileName}</div>
                    </div>

                    {
                        pdfFile &&
                        <>
                            <div className="check-box">
                                <input type="checkbox" name="removeExistingImage" id="remove-photo" 
                                    onChange={handleCheckboxChange} checked={outputSettings.removeExistingImage} />
                                <label htmlFor="remove-photo">Remove Modi's Photo</label>
                            </div>

                            <div className="check-box">
                                <input type="checkbox" name="removeExistingName" id="remove-name" 
                                    onChange={handleCheckboxChange} checked={outputSettings.removeExistingName} />
                                <label htmlFor="remove-name">Remove Modi's Name</label>
                            </div>

                            {
                                outputSettings.removeExistingImage &&
                                <div className="check-box">
                                    <input type="checkbox" name="replaceWithUserImage" id="add-photo" 
                                        onChange={handleCheckboxChange} checked={outputSettings.replaceWithUserImage} />
                                    <label htmlFor="add-photo">Add My Photo</label>
                                </div>
                            }

                            {
                                outputSettings.replaceWithUserImage &&
                                <div className="file-upload-block">
                                    <label htmlFor="picture" className="btn">Upload My Photo</label>
                                    <input type="file" id="picture" name="picture" accept=".jpg,.png"
                                        onChange={handleFileUpload}></input>

                                    <div>{imageFileName}</div>
                                </div>
                            }

                            {
                                outputSettings.removeExistingName &&
                                <div className="check-box">
                                    <input type="checkbox" name="replaceWithUserName" id="replace-name" 
                                        onChange={handleCheckboxChange} checked={outputSettings.replaceWithUserName}/>
                                    <label htmlFor="replace-name">Add My Name</label>
                                </div>
                            }

                            {
                                outputSettings.replaceWithUserName &&
                                <div className="form-input text-center">
                                    <input type="text" name="userName" id="user-name" 
                                        onChange={handleUserNameChange} value={userName}/>
                                </div>
                            }

                            {
                                <div className="generate-pdf-block">
                                    <button className="btn" disabled={!generatePdfEnabled()} onClick={processPdf}>Generate PR Free Certificate</button>
                                </div>
                            }

                        </>
                    }
                </section>
            }
            {
                base64PDF &&
                <section className="preview">
                    <div style={{ height: "100vh" }}>
                        <iframe
                            title="frame"
                            width="100%"
                            height="100%"
                            src={`${base64PDF}`} />
                    </div>
                </section>
            }

        </div>

    )
}

type OutputSettings = {
    removeExistingImage: boolean,
    replaceWithUserImage: boolean,
    removeExistingName: boolean,
    replaceWithUserName: boolean
}