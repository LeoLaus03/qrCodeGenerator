from flask import Flask, request, jsonify, render_template, send_file
import qrcode
import os
import numpy as np
from stl import mesh
import webview
import base64
import threading
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Route für die HTML-Seite
@app.route('/')
def index_page():
    return render_template('./index.html')

# Verzeichnis für QR-Codes
QR_DIR = "static"
if not os.path.exists(QR_DIR):
    os.makedirs(QR_DIR)

@app.route('/generate_qr_img', methods=['POST'])
def generate_qr_img():
    data = request.json.get('text', '')
    qr_path = os.path.join(QR_DIR, "qrcode.png")
    img = qrcode.make(data)
    img.save(qr_path)
    return jsonify({"message": "QR Code generated successfully!", "qr_url": "/static/qrcode.png"})

@app.route('/generate_qr_stl', methods=['POST'])
def generate_qr_stl():
    data = request.json.get('text', '')
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_L, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill='black', back_color='white')

    # Bild in ein NumPy Array umwandeln
    img = img.convert('1')  # Schwarz/Weiß
    img_array = np.array(img)

    # 3D-Mesh erstellen
    width, height = img.size
    verts = []
    faces = []
    for y in range(height):
        for x in range(width):
            if img_array[y, x] == 0:  # Schwarze Pixel
                z = 1  # Höhe der schwarzen Pixel
                verts.append([x, y, z])
            else:  # Weiße Pixel
                z = 0
                verts.append([x, y, z])

    # Erstelle die Faces
    for y in range(height - 1):
        for x in range(width - 1):
            i = y * width + x
            i1 = i + 1
            i2 = i + width
            i3 = i2 + 1
            faces.append([i, i1, i2])
            faces.append([i1, i3, i2])

    # NumPy Mesh erstellen
    faces = np.array(faces)
    vertices = np.array(verts)

    # STL-File speichern
    qr_mesh = mesh.Mesh(np.zeros(faces.shape[0], dtype=mesh.Mesh.dtype))
    for i, f in enumerate(faces):
        for j in range(3):
            qr_mesh.vectors[i][j] = vertices[f[j], :]

    qr_mesh.save('qr_code.stl')
    # Datei im response-Stream zurückgeben
    download_path = os.path.join(app.root_path, 'static', 'qr_code.stl')
    qr_mesh.save(download_path)
    return send_file(download_path, as_attachment=True)

@app.route('/save_file', methods=['POST'])
def save_file():
    file_data = request.json.get('file_data', '')
    filename = request.json.get('filename', 'downloaded_file.stl')

    # Datei speichern
    filepath = os.path.join(QR_DIR, filename)
    with open(filepath, 'wb') as f:
        f.write(base64.b64decode(file_data))

    return jsonify({"message": f"Datei gespeichert unter: {filepath}"})


class API:
    def save_file(self, file_data, filename):
        filepath = os.path.join(QR_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(base64.b64decode(file_data))
        return f"Datei gespeichert als {filepath}"


if __name__ == '__main__':
    # Flask starten in einem separaten Thread
    flask_thread = threading.Thread(target=lambda: app.run(debug=False, port=5000, use_reloader=False))
    flask_thread.daemon = True  # Damit der Thread beim Beenden der Anwendung automatisch beendet wird
    flask_thread.start()

    # Webview starten
    api = API()
    webview.create_window("QR Code Generator", "http://127.0.0.1:5000", width=500, height=500, js_api=api)
    webview.start()