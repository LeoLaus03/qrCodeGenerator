document.getElementById("qrCodeErstellenButton").addEventListener("click", generateQRCode);
document.getElementById("qrCodeDownloadButton").addEventListener("click", downloadQRCodeAsSTL);

function generateQRCode() {
    let inputText = document.getElementById("linkInput").value;

    // CORS Header hinzufügen, falls Flask über Webview läuft
    fetch('https://qrcodegenerator-wvc1.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);

            const imgElement = document.querySelector("#qrCodeIMG");
            if (!imgElement) {
                let newIMGElement = document.createElement("img");
                newIMGElement.id = "qrCodeIMG";
                newIMGElement.src = data.qr_url + '?t=' + new Date().getTime();
                document.querySelector(".container").insertBefore(newIMGElement, document.querySelector("#qrCodeDownloadButton"));
            } else {
                imgElement.src = data.qr_url + '?t=' + new Date().getTime();
            }
        })
        .catch(error => console.error('Error:', error));
}

function downloadQRCodeAsSTL() {
    let inputText = document.getElementById("linkInput").value;

    // CORS Header hinzufügen, falls Flask über Webview läuft
    fetch('https://qrcodegenerator-wvc1.onrender.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
    })
    .then(response => response.blob())
    .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'qr_code.stl';
        link.click();
    })
    .catch(error => console.error('Fehler beim Download:', error));
}

// function downloadQRCodeAsSTL() {
//     let inputText = document.getElementById("linkInput").value;

//     fetch('http://127.0.0.1:5000/generate_qr_stl', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: inputText }),
//     })
//     .then(response => response.blob())
//     .then(blob => {
//         // Speichere die Datei lokal (nur für Desktop)
//         if (window.pywebview) {
//             const reader = new FileReader();
//             reader.onloadend = function () {
//                 const base64Data = reader.result.split(',')[1];
//                 window.pywebview.api.save_file(base64Data, 'qr_code.stl').then((message) => {
//                     console.log(message);
//                 });
//             };
//             reader.readAsDataURL(blob);
//         } else {
//             // Browser-Fallback
//             const link = document.createElement('a');
//             link.href = URL.createObjectURL(blob);
//             link.download = 'qr_code.stl';
//             link.click();
//         }
//     })
//     .catch(error => console.error('Fehler beim Download:', error));
// }

// function downloadQRCodeAsSTL() {
//     let inputText = document.getElementById("linkInput").value;

//     fetch('http://127.0.0.1:5000/generate_qr_stl', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: inputText }),
//     })
//     .then(response => response.blob())
//     .then(blob => {
//         // Wenn pywebview verfügbar ist, wird es in den Downloads-Ordner heruntergeladen
//         if (window.pywebview) {
//             const link = document.createElement('a');
//             link.href = URL.createObjectURL(blob);
//             link.download = 'qr_code.stl';
//             link.click();
//         } else {
//             // Fallback für den normalen Browser
//             const link = document.createElement('a');
//             link.href = URL.createObjectURL(blob);
//             link.download = 'qr_code.stl';
//             link.click();
//         }
//     })
//     .catch(error => console.error('Fehler beim Download:', error));
// }