
import React from 'react';
import { Voucher } from '../types';

interface VoucherPrintoutProps {
  voucher: Voucher;
}

const VoucherPrintout: React.FC<VoucherPrintoutProps> = ({ voucher }) => {
  return (
    <div 
      id="voucher-document"
      className="bg-white p-8 md:p-12 border border-slate-300 print-area max-w-[800px] mx-auto min-h-[1050px] flex flex-col shadow-sm text-black"
    >
      {/* Header with Adjusted Logo */}
      <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-8">
        <div className="flex flex-col">
          <svg width="240" height="60" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-1">
            <text 
              x="0" 
              y="45" 
              fill="#000000" 
              style={{ 
                font: 'bold 46px Arial, Helvetica, sans-serif', 
                letterSpacing: '-1.5px',
                fontWeight: 900
              }}
            >
              Rent-a-Guide
            </text>
            <text 
              x="2" 
              y="68" 
              fill="#1e293b" 
              style={{ 
                font: 'bold 15px Arial, Helvetica, sans-serif', 
                letterSpacing: '0.2px' 
              }}
            >
              PROFESSIONAL GUIDE SERVICES
            </text>
          </svg>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black text-black uppercase tracking-tight">Work Order / Voucher</h2>
          <p className="text-3xl font-mono font-bold text-blue-700 mt-2">#{voucher.voucherNumber}</p>
        </div>
      </div>

      {/* Main Content Fields - Increased contrast on labels from slate-400 to slate-700 */}
      <div className="grid grid-cols-2 gap-y-8 gap-x-12 flex-grow">
        <div className="col-span-2 flex items-baseline border-b-2 border-slate-300 pb-2">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">TO:</span>
          <span className="text-xl font-bold text-black">{voucher.to}</span>
        </div>

        <div className="flex items-baseline border-b-2 border-slate-300 pb-2">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">Date:</span>
          <span className="text-xl font-bold text-black">{new Date(voucher.dateOfService).toLocaleDateString('en-GB')}</span>
        </div>

        <div className="flex items-baseline border-b-2 border-slate-300 pb-2">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">Visit Time:</span>
          <span className="text-xl font-bold text-black">{voucher.visitTime || '--:--'}</span>
        </div>

        <div className="flex items-baseline border-b-2 border-slate-300 pb-2">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">Tour #:</span>
          <span className="text-xl font-bold text-black">{voucher.tourNumber}</span>
        </div>

        <div className="flex items-baseline border-b-2 border-slate-300 pb-2">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">Pax:</span>
          <span className="text-xl font-bold text-black">{voucher.numberOfTravelers}</span>
        </div>

        <div className="col-span-2 flex items-baseline border-b-2 border-slate-300 pb-2">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">Service:</span>
          <span className="text-xl font-bold text-black">{voucher.serviceType}</span>
        </div>

        <div className="col-span-2 mt-4">
          <span className="text-xs font-black text-slate-700 uppercase block mb-3">Service Description:</span>
          <div className="p-5 bg-slate-50 rounded-lg min-h-[180px] text-black text-lg leading-relaxed border-2 border-slate-200 whitespace-pre-wrap font-medium">
            {voucher.serviceDescription || 'No detailed description provided.'}
          </div>
        </div>

        <div className="col-span-2 flex items-baseline border-b-2 border-slate-300 pb-2 mt-4">
          <span className="text-xs font-black text-slate-700 uppercase w-32 shrink-0">Guide:</span>
          <span className="text-xl font-bold text-black">{voucher.guideName}</span>
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-12 pt-8">
        <div className="flex justify-between items-end mb-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-800 uppercase mb-20 tracking-widest">Authorized Signature</span>
            <div className="w-72 border-t-2 border-black"></div>
          </div>
          <div className="text-right italic text-slate-600 text-[10px] font-bold">
            Created: {new Date(voucher.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="bg-black text-white p-6 rounded-t-xl text-center">
          <p className="text-xl font-bold">Please charge our account for the above service</p>
          <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-widest font-bold">Thank you for your cooperation</p>
        </div>

        {/* Company Contact Details - Higher contrast labels */}
        <div className="bg-slate-100 border-x-2 border-b-2 border-slate-300 p-4 rounded-b-xl flex flex-col md:flex-row justify-between items-center text-[11px] text-black font-black tracking-tight uppercase">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <i className="fas fa-map-marker-alt text-blue-700"></i>
            <span>YAVETZ 33 TEL AVIV</span>
          </div>
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <i className="fas fa-phone text-blue-700"></i>
            <span>TEL: 035163369</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-envelope text-blue-700"></i>
            <span>EMAIL: RESERVATION20@RENT-A-GUIDE.CO.IL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherPrintout;
