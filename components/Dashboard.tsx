
import React, { useState, useMemo } from 'react';
import { Voucher } from '../types';

interface DashboardProps {
  vouchers: Voucher[];
  onViewVoucher: (voucher: Voucher) => void;
  onEditVoucher: (voucher: Voucher) => void;
  onCreateNew: () => void;
}

type SortField = 'voucherNumber' | 'dateOfService';
type SortOrder = 'asc' | 'desc';

const Dashboard: React.FC<DashboardProps> = ({ vouchers, onViewVoucher, onEditVoucher, onCreateNew }) => {
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterGuide, setFilterGuide] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('dateOfService');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const uniqueServices = useMemo(() => {
    return Array.from(new Set(vouchers.map(v => v.serviceType))).sort();
  }, [vouchers]);

  const filteredAndSortedVouchers = useMemo(() => {
    let result = [...vouchers];
    if (filterStartDate) result = result.filter(v => v.dateOfService >= filterStartDate);
    if (filterEndDate) result = result.filter(v => v.dateOfService <= filterEndDate);
    if (filterService) result = result.filter(v => v.serviceType === filterService);
    if (filterGuide) result = result.filter(v => v.guideName.toLowerCase().includes(filterGuide.toLowerCase()));

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'voucherNumber') comparison = a.voucherNumber - b.voucherNumber;
      else comparison = new Date(a.dateOfService).getTime() - new Date(b.dateOfService).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [vouchers, filterStartDate, filterEndDate, filterService, filterGuide, sortBy, sortOrder]);

  const handleExportCSV = () => {
    if (filteredAndSortedVouchers.length === 0) return;
    const headers = ["Voucher Number", "To", "Service Type", "Date of Service", "Tour Number", "Travelers", "Guide Name", "Created At"];
    const rows = filteredAndSortedVouchers.map(v => {
      const escape = (val: any) => {
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) return `"${str.replace(/"/g, '""')}"`;
        return str;
      };
      return [v.voucherNumber, escape(v.to), escape(v.serviceType), v.dateOfService, escape(v.tourNumber), v.numberOfTravelers, escape(v.guideName), v.createdAt].join(",");
    });

    // Add UTF-8 BOM for Hebrew support in Excel
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vouchers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Voucher History</h1>
          <p className="text-slate-500">Track and manage your generated work orders.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm"
          >
            <i className="fas fa-file-csv text-green-600"></i>
            <span>Export CSV</span>
          </button>
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center space-x-2 transition-all shadow-md"
          >
            <i className="fas fa-plus"></i>
            <span>New Voucher</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
        <select value={filterService} onChange={e => setFilterService(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Services</option>
          {uniqueServices.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Search guide..." value={filterGuide} onChange={e => setFilterGuide(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => setSortBy('voucherNumber')}># Number</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">To</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => setSortBy('dateOfService')}>Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Service</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAndSortedVouchers.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-blue-600">{v.voucherNumber}</td>
                <td className="px-6 py-4 font-medium">{v.to}</td>
                <td className="px-6 py-4 text-slate-500">{new Date(v.dateOfService).toLocaleDateString('en-GB')}</td>
                <td className="px-6 py-4"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{v.serviceType}</span></td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => onEditVoucher(v)} className="text-slate-400 hover:text-blue-600 p-2"><i className="fas fa-edit"></i></button>
                  <button onClick={() => onViewVoucher(v)} className="text-slate-400 hover:text-slate-900 p-2"><i className="fas fa-print"></i></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;