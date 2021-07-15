import { useEffect } from "react";

import './Viewer.css';

const Viewer = (props: { dataUri: string }) => {
    useEffect(() => {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        const loadingTask = pdfjsLib.getDocument(props.dataUri);
        loadingTask.promise.then((pdf: any) => {
            console.log("Certificate PDF Loaded");
            pdf.getPage(1).then((page: any) => {
                console.log("Certificate Page Loaded");

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.getElementById("pdf-viewer") as HTMLCanvasElement;
                if (!canvas) {
                    console.error("Canvas not found");
                    return;
                }
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext).promise.then(() => {
                    console.log("Certificate Rendered");
                    window.scrollTo(0, document.body.scrollHeight);
                });
            })
        }, (error: any) => {
            console.error(error)
        })
    }, [props.dataUri])

    return (
        <div className="pdf-viewer">
            <canvas id="pdf-viewer"></canvas>
        </div>
    )

}

export default Viewer
