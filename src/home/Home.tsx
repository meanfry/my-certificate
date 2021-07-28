import { BaseSyntheticEvent, useEffect, useRef, useState } from "react";

import Viewer from '../viewer/Viewer';
import { processPdf } from "./processPdf";
import './Home.css';
import { resizeImage } from "./resizeImage";
import { logEvent } from "../analytics/analytics";

export const HomeComponent = () => {
    const [pdfFile, setPdfFile] = useState<any>(undefined);
    const [imageFile, setImageFile] = useState<string>("");
    // two states for userName to avoid render on every input change.
    const [userNameForModal, setUserNameForModal] = useState(""); // for the actual input field on modal
    const [userName, setUserName] = useState(""); // for name on certificate - update only on button click
    const [base64PDF, setBase64PDF] = useState("");
    const [removePr, setRemovePr] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [imageRotation, setImageRotation] = useState<number>(0);

    const pictureUpload = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function updatePDF() {
            const pdfB64 = await processPdf(pdfFile, imageFile, userName, removePr, imageRotation);
            if (pdfB64) setBase64PDF(pdfB64);
        }
        updatePDF();
    }, [pdfFile, imageFile, userName, removePr, imageRotation])

    const handleFileUpload = async (e: BaseSyntheticEvent) => {
        const file = e.target.files[0];
        if (!file) return;
        switch (e.target.name) {
            case "picture":
                const resolutionAdjustedImage = await resizeImage(file);
                setImageFile(resolutionAdjustedImage);
                break;
            case "certificate-pdf":
                logEvent("load-cert")
                setPdfFile(file);
                break;
        }
    }

    const handleUserNamForModalChange = (e: any) => {
        setUserNameForModal(e.target.value);
    }

    const updateUserName = (e: any) => {
        setModalOpen(false);
        setUserName(userNameForModal);
    }

    const handleActionButtonClick = (event: any) => {
        if (event.target.id === "download") {
            logEvent("download")
            downloadPdf(base64PDF);
            return;
        }

        const { settings } = event.target.dataset;
        switch (settings) {
            case "replaceWithUserImage":
                pictureUpload.current && pictureUpload.current.click();
                break;
            case "replaceWithUserName":
                setModalOpen(true);
                break;
            case "removePr":
                setRemovePr(true);
                break;
            case "rotateUserImage":
                setImageRotation(rotation => (rotation + 90) % 360)
                break;
        }
    }

    return (
        <div className="container">
            {
                !base64PDF &&
                <>
                    <section className="home">
                        <div className="file-upload-block">
                            <div style={{ "margin": "12px 0 24px" }}>
                                <strong>Disclaimer</strong>
                                <br />
                                Updated certificate is not a valid document.
                                <br />
                                By continuing, you agree to make cosmetic changes to a copy of your certificate.
                                <br />
                                Your certificate, photo, name or any other identifiable information is not collected.
                            </div>
                            <label htmlFor="certificate-pdf" className="btn">Open Certificate</label>
                            <input type="file" id="certificate-pdf" name="certificate-pdf" accept="application/pdf"
                                onChange={handleFileUpload}></input>
                        </div>
                        <div className="home-image">
                            <img src="/home.png" alt="Sample of certificate with details updated for demo" />
                        </div>
                    </section>
                </>
            }
            {
                base64PDF &&
                <div className="action-buttons" onClickCapture={handleActionButtonClick}>
                    {
                        removePr ?
                            (<>
                                <div className="action-button" id="upload-image" data-settings="replaceWithUserImage">
                                    <div className="icon">
                                        {
                                            // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                            <img src="/upload-user.png" alt="Upload photo to replace Modi photo in certificate" />
                                        }
                                        <input type="file" id="picture" name="picture" accept="image/x-png,image/jpeg"
                                            onChange={handleFileUpload} ref={pictureUpload}></input>
                                    </div>
                                    <div className="label">
                                        Update Photo on Certificate
                                    </div>
                                </div>
                                {
                                    imageFile &&
                                    <div className="action-button" id="rotate-image" data-settings="rotateUserImage">
                                        <div className="icon">
                                            {
                                                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                                                <img src="/rotate-image.png" alt="Rotate Uploaded Photo" />
                                            }
                                        </div>
                                        <div className="label">
                                            Rotate Uploaded Photo
                                        </div>
                                    </div>
                                }

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
                            value={userNameForModal} onChange={handleUserNamForModalChange} />
                        <div className="btn" onClick={updateUserName}>Update Name</div>
                    </div>
                </div>
            }
        </div>

    )
}

const downloadPdf = (pdfB64: string) => {
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
