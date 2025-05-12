import { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { CertificatePDF } from './CertificatePDF';
import { Loader2, X } from 'lucide-react';

export const PreviewModal = ({ data, onClose, onConfirm }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container mx-auto p-4 h-screen">
        <div className="bg-white rounded-lg shadow-xl h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Certificate Preview</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
              </div>
            )}

            <PDFViewer 
              className="w-full h-full"
              onLoad={() => setIsLoading(false)}
            >
              <CertificatePDF data={data} />
            </PDFViewer>
          </div>

          <div className="flex justify-end gap-4 p-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Confirm & Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};