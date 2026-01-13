
import React from 'react';
import { Voucher } from '../types';

interface VoucherPrintoutProps {
  voucher: Voucher;
}

const VoucherPrintout: React.FC<VoucherPrintoutProps> = ({ voucher }) => {
  return (
    <div 
      id="voucher-document"
      className="bg-white p-8 md:p-12 border border-slate-200 print-area max-w-[800px] mx-auto min-h-[1050px] flex flex-col shadow-sm"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
        <div className="flex items-center space-x-5">
          {/* Professional Placeholder Logo */}
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <svg 
              width="36" 
              height="36" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" opacity="0.3"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">
              RENT A GUIDE
            </h1>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.2em] mt-2">
              Premium Touring Services
            </p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Work Order / Voucher</h2>
          <p className="text-2xl font-mono font-bold text-blue-600 mt-2">#{voucher.voucherNumber}</p>
        </div>
      </div>

      {/* Main Content Fields */}
      <div className="grid grid-cols-2 gap-y-8 gap-x-12 flex-grow">
        <div className="col-span-2 flex items-baseline border-b border-slate-200 pb-2">
          <span className="text-sm font-bold text-slate-400 uppercase w-32 shrink-0">TO:</span>
          <span className="text-lg font-semibold text-slate-900">{voucher.to}</span>
        </div>

        <div className="flex items-baseline border-b border-slate-200 pb-2">
          <span className="text-sm font-bold text-slate-400 uppercase w-32 shrink-0">Date:</span>
          <span className="text-lg font-semibold text-slate-900">{new Date(voucher.dateOfService).toLocaleDateString('en-GB')}</span>
        </div>

        <div className="flex items-baseline border-b border-slate-200 pb-2">
          <span className="text-sm font-bold text-slate-400 uppercase w-32 shrink-0">Tour #:</span>
          <span className="text-lg font-semibold text-slate-900">{voucher.tourNumber}</span>
        </div>

        <div className="flex items-baseline border-b border-slate-200 pb-2">
          <span className="text-sm font-bold text-slate-400 uppercase w-32 shrink-0">Pax:</span>
          <span className="text-lg font-semibold text-slate-900">{voucher.numberOfTravelers}</span>
        </div>

        <div className="flex items-baseline border-b border-slate-200 pb-2">
          <span className="text-sm font-bold text-slate-400 uppercase w-32 shrink-0">Service:</span>
          <span className="text-lg font-semibold text-slate-900">{voucher.serviceType}</span>
        </div>

        <div className="col-span-2 mt-4">
          <span className="text-sm font-bold text-slate-400 uppercase block mb-3">Service Description:</span>
          <div className="p-4 bg-slate-50 rounded-lg min-h-[150px] text-slate-800 leading-relaxed border border-slate-100 whitespace-pre-wrap">
            {voucher.serviceDescription}
          </div>
        </div>

        <div className="col-span-2 flex items-baseline border-b border-slate-200 pb-2 mt-4">
          <span className="text-sm font-bold text-slate-400 uppercase w-32 shrink-0">Guide:</span>
          <span className="text-lg font-semibold text-slate-900">{voucher.guideName}</span>
        </div>
      </div>

      {/* Footer Area */}
      <div className="mt-12 pt-8">
        <div className="flex justify-between items-end mb-10">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase mb-16 tracking-widest">Authorized Signature</span>
            <div className="w-64 border-t border-slate-300"></div>
          </div>
          <div className="text-right italic text-slate-400 text-xs">
            Created: {new Date(voucher.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-t-xl text-center">
          <p className="text-lg font-medium">Please charge our account for the above service</p>
          <p className="text-xs text-slate-400 mt-2 uppercase tracking-widest">Thank you for your cooperation</p>
        </div>

        {/* Company Contact Details */}
        <div className="bg-slate-100 border-x border-b border-slate-200 p-4 rounded-b-xl flex flex-col md:flex-row justify-between items-center text-[10px] md:text-xs text-slate-600 font-bold tracking-tight uppercase">
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <i className="fas fa-map-marker-alt text-blue-600"></i>
            <span>YAVETZ 33 TEL AVIV</span>
          </div>
          <div className="flex items-center space-x-2 mb-2 md:mb-0">
            <i className="fas fa-phone text-blue-600"></i>
            <span>TEL: 035163369</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-envelope text-blue-600"></i>
            <span>EMAIL: RESERVATION20@RENT-A-GUIDE.CO.IL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherPrintout;
