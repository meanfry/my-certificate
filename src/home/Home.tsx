import { BaseSyntheticEvent, useEffect, useRef, useState } from "react";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

import Viewer from '../viewer/Viewer';

import './Home.css';

export const HomeComponent = () => {
    const [pdfFile, setPdfFile] = useState<any>(undefined);
    const [imageFile, setImageFile] = useState<any>(undefined);
    const [userName, setUserName] = useState("");
    const [base64PDF, setBase64PDF] = useState("");
    const [outputSettings, setOutputSettings] = useState<OutputSettings>({
        removePr: false,
        replaceWithUserImage: false,
        replaceWithUserName: false
    });
    const [modalOpen, setModalOpen] = useState(false);

    const pictureUpload = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (pdfFile) processPdf()
    }, [pdfFile, imageFile, outputSettings.removePr])

    const handleFileUpload = (e: BaseSyntheticEvent) => {
        const file = e.target.files[0];
        if (!file) return;
        switch (e.target.name) {
            case "picture":
                setImageFile(file);
                break;
            case "certificate-pdf":
                setPdfFile(file);
                break;
        }
    }

    const handleUserNameChange = (e: any) => {
        setUserName(e.target.value);
    }

    const updateUserName = (e: any) => {
        setModalOpen(false);
        processPdf();
    }

    const processPdf = async () => {
        const data = await (pdfFile as File).arrayBuffer();
        const pdfDoc = await PDFDocument.load(data);
        const page = pdfDoc.getPages()[0];

        if (outputSettings.removePr) {
            // hide original image.
            page.drawRectangle({
                x: 35,
                y: 145,
                width: 100,
                height: 100,
                color: rgb(.91, .93, .94)
            });

            if (outputSettings.replaceWithUserImage && imageFile) {
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

    const handleActionButtonClick = (event: any) => {
        const { settings } = event.target.dataset;
        if (settings) {
            setOutputSettings({ ...outputSettings, ...{ [settings]: true } })
        } else {
            if (event.target.id === "download") downloadPdf(base64PDF);
        }

        switch (settings) {
            case "replaceWithUserImage":
                pictureUpload.current && pictureUpload.current.click();
                break;
            case "replaceWithUserName":
                setModalOpen(true);
                console.log("todo")
        }
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
                    </div>
                </section>
            }
            {
                base64PDF &&
                <div className="action-buttons" onClickCapture={handleActionButtonClick}>
                    {
                        outputSettings.removePr ?
                            (<>
                                <div className="action-button" id="upload-image" data-settings="replaceWithUserImage">
                                    <div className="icon">
                                        <img src="/upload-user.png" alt="Upload photo to replace Modi photo in certificate" />
                                        <input type="file" id="picture" name="picture" accept=".jpg,.png"
                                            onChange={handleFileUpload} ref={pictureUpload}></input>
                                    </div>
                                    <div className="label">
                                        Update Photo on Certificate
                                    </div>
                                </div>
                                <div className="action-button" id="update-name" data-settings="replaceWithUserName">
                                    <div className="icon">
                                        <img src="/editing.png" alt="update name" />
                                    </div>
                                    <div className="label">
                                        Update Name on Certificate
                                    </div>
                                </div>
                                <div className="action-button" id="download">
                                    <div className="icon">
                                        <img src="/download.png" alt="download demodified certificate" />
                                    </div>
                                    <div className="label">
                                        Download Updated Certificate
                                    </div>
                                </div>
                            </>)
                            :
                            <div className="action-button" id="demodify" data-settings="removePr">
                                <div className="icon">
                                    <img src="/sweeping.png" alt="demodify" />
                                </div>
                                <div className="label">
                                    Remove Existing Photo and Name
                                </div>
                            </div>
                    }


                </div>
            }
            {
                base64PDF &&
                <section className="preview">
                    <Viewer dataUri={base64PDF}></Viewer>
                </section>
            }
            {
                modalOpen &&
                <div className="modal" id="user-name-modal">
                    <div className="modal-content">
                        <input className="form-input" type="text" id="user-name" name="user-name" autoComplete="off"
                            value={userName} onChange={handleUserNameChange} />
                        <div className="btn" onClick={updateUserName}>Update Name</div>
                    </div>
                </div>
            }
        </div>

    )
}

const downloadPdf = (pdfB64: string) => {
    console.log(pdfB64)
    const link = document.createElement("a");
    link.href = pdfB64;
    link.download = "certificate_updated";
    document.body.appendChild(link);
    link.dispatchEvent(
        new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        })
    );
    document.body.removeChild(link);
}

type OutputSettings = {
    removePr: boolean
    replaceWithUserImage: boolean
    replaceWithUserName: boolean
}