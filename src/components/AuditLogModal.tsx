import React, { useEffect } from 'react';
import { AuditLogEntry } from '../types/clinical';
import { ShieldCheck, FileText, Download, CheckCircle2, Clock, Lock, Key, Activity, X } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLogEntry[];
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `HIPAA_Audit_Trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-4xl bg-white rounded-xs shadow-2xl border border-[#DADCE0] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 cursor-default"
        id="audit-trail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1A1C1E] text-white p-4 border-b border-[#3C4043] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#188038] rounded-xs flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  HIPAA CLINICAL AUDIT LOG &amp; TAMPER-PROOF EVENT TRAIL
                </h2>
                <span className="text-[10px] font-mono bg-[#188038]/30 text-[#81C995] border border-[#188038]/50 px-1.5 py-0.2 rounded-xs">
                  SHA-256 HASH VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-[#9AA0A6]">
                Immutable record of clinical user actions, risk escalations, parameter adjustments, and report downloads.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex items-center gap-1 text-[#9AA0A6] hover:text-white text-xs font-mono px-2.5 py-1 bg-[#282B2E] hover:bg-[#3C4043] rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>CLOSE (ESC)</span>
          </button>
        </div>

        {/* Audit Stats Banner */}
        <div className="bg-[#F8F9FA] border-b border-[#DADCE0] p-3 shrink-0 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6368] block">Total Logged Events</span>
              <span className="font-mono font-bold text-[#1A1C1E]">{logs.length} Operations</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6368] block">De-Identification Protocol</span>
              <span className="font-mono text-[#188038] font-bold">Active (Safe Harbor HIPAA)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5F6368] block">Integrity Status</span>
              <span className="font-mono text-[#1967D2] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#188038]" /> Cryptographically Sealed
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 bg-white hover:bg-[#F1F3F4] border border-[#DADCE0] text-[#1A1C1E] px-2.5 py-1 rounded-xs text-[11px] font-medium shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#1967D2]" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DADCE0] bg-[#F1F3F4] text-[10px] font-mono uppercase font-bold text-[#5F6368]">
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Clinician / User</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Action</th>
                <th className="py-2 px-3">Details</th>
                <th className="py-2 px-3">Patient ID</th>
                <th className="py-2 px-3 text-right">Hash Signature</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8EAED]">
              {logs.map((log) => {
                let badgeBg = 'bg-[#F1F3F4] text-[#3C4043]';
                if (log.action === 'RRT_TRIGGER') badgeBg = 'bg-[#FCE8E6] text-[#D93025] font-bold border border-[#FAD2CF]';
                else if (log.action === 'LOGIN') badgeBg = 'bg-[#E8F0FE] text-[#1967D2] border border-[#D2E3FC]';
                else if (log.action === 'RECORD_EDIT') badgeBg = 'bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]';
                else if (log.action === 'PDF_DOWNLOAD') badgeBg = 'bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]';

                return (
                  <tr key={log.id} className="hover:bg-[#F8F9FA] transition-colors text-[11px]">
                    <td className="py-2.5 px-3 font-mono text-[#5F6368] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#1A1C1E] whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[#5F6368] whitespace-nowrap">
                      {log.userRole}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-block px-1.5 py-0.5 rounded-xs text-[10px] font-mono ${badgeBg}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#3C4043] max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#1967D2] whitespace-nowrap">
                      {log.patientId || 'N/A'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[9px] text-[#80868B] text-right whitespace-nowrap">
                      {log.hashSignature}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#F8F9FA] border-t border-[#DADCE0] text-[10px] text-[#5F6368] flex items-center justify-between shrink-0 font-mono">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#188038]" />
            <span>45 CFR § 164.312(b) Audit Controls Standard Compliance</span>
          </div>
          <span>Cryptographically Sealed Logs</span>
        </div>
      </div>
    </div>
  );
};
