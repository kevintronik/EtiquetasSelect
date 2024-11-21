import React, { useState, useEffect, useRef } from 'react';
import { read, utils } from 'xlsx';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { FileUp, Barcode, QrCode } from 'lucide-react';

interface CodeData {
  Flecha: string;
  code: string;
  estante: string;
  modulo: string;
  nivel: string;
}

function App() {
  const [data, setData] = useState<CodeData[]>([]);
  const [selectedType, setSelectedType] = useState<'barcode' | 'qrcode'>('barcode');
  const canvasRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(firstSheet) as CodeData[];
      setData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    data.forEach((item) => {
      const canvas = canvasRefs.current[item.code];
      if (!canvas) return;

      if (selectedType === 'barcode') {
        JsBarcode(canvas, item.code, {
          format: 'CODE128',
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 14,
        });
      } else {
        QRCode.toCanvas(canvas, item.code, {
          width: 128,
          margin: 2,
        });
      }
    });
  }, [data, selectedType]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div id="etiquetamargen" className="mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            {selectedType === 'barcode' ? <Barcode className="w-8 h-8" /> : <QrCode className="w-8 h-8" />}
            {selectedType === 'barcode' ? 'Barcode' : 'QR Code'} Generator
          </h1>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                <FileUp className="w-5 h-5" />
               Subir Plantilla de Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                <FileUp className="w-5 h-5" />
                Imprimir
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedType('barcode')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedType === 'barcode'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <Barcode className="w-5 h-5" />
                  Codigo de Barras
                </button>
                <button
                  onClick={() => setSelectedType('qrcode')}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedType === 'qrcode'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                 Codigo QR
                </button>
              </div>
            </div>

            {data.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6">
                {data.map((item) => (
                  <div
                    key={item.code}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div id="etiquetasclase">
                      <p id="textoetiqueta" className="text-sm text-gray-600">{item.flecha}</p>
                      <canvas
                        ref={(el) => (canvasRefs.current[item.code] = el)}
                        className="max-w-full"
                      />
                      <p id="textoetiqueta" className="font-medium">{item.estante}</p>
                      <p id="textoetiqueta" className="font-medium">{item.modulo}</p>
                      <p id="textoetiqueta" className="text-sm text-gray-600">{item.nivel}</p>
                    </div>
              
                  </div>
                ))}
              </div>
            )}

            {data.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>Subir Archivo de Excel</p>
                <p className="text-sm mt-2">
                 El Excel debe de Contener las Columnas: id, code, description, type, quantity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;