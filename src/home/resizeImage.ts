export const resizeImage = (file: File) => {
    const fileType = file.type;
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
            const image = new Image();
            image.src = reader.result as string;

            image.onload = function () {
                const maxWidth = 540,
                    maxHeight = 540;
                let imageWidth = image.width,
                    imageHeight = image.height;

                if (imageWidth > imageHeight) {
                    if (imageWidth > maxWidth) {
                        imageHeight *= maxWidth / imageWidth;
                        imageWidth = maxWidth;
                    }
                }
                else {
                    if (imageHeight > maxHeight) {
                        imageWidth *= maxHeight / imageHeight;
                        imageHeight = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = imageWidth;
                canvas.height = imageHeight;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
                }

                const finalFile = canvas.toDataURL(fileType);
                resolve(finalFile)
            }
        }
        reader.readAsDataURL(file);
    })
}

