import React, { useEffect } from 'react';
import { ShieldAlert, X, CheckCircle, Info, Lock, AlertTriangle, FileCode } from 'lucide-react';

interface ClinicalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClinicalDisclaimerModal: React.FC<ClinicalDisclaimerModalProps> = ({
  isOpen,
  onClose,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1C1E]/70 backdrop-blur-xs cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-xs border border-[#E0E2E6] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1A1C1E] text-white p-4 flex items-center justify-between border-b border-[#2D3135]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-[#2D3135] border border-[#3C4043] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-[#8AB4F8]" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">Advance Health &bull; Methodological Notice</h3>
              <p className="text-[10px] font-mono text-[#9AA0A6]">Clinical Decision-Support &amp; Research Prototype</p>
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

        {/* Content */}
        <div className="p-5 space-y-4 text-xs text-[#3C4043] max-h-[70vh] overflow-y-auto leading-relaxed">
          <div className="bg-[#FEF7E0] border border-[#FCE293] rounded-xs p-3 text-[#B06000] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#B06000] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#703800] font-bold text-xs uppercase tracking-wider mb-0.5">
                Research Prototype Notice
              </strong>
              This platform is a clinical decision-support research demonstration designed to study uncertainty communication and false-alarm mitigation in AI early-warning systems. It is NOT an FDA-cleared diagnostic device and should never replace licensed clinical judgment.
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#1A1C1E] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <Lock className="w-3.5 h-3.5 text-[#1967D2]" />
              1. Mechanical Confidence Capping Theorem
            </h4>
            <p className="text-[#5F6368]">
              Unlike legacy LLM prompting where models self-report arbitrary confidence, Advance Health derives confidence <em>mechanically</em> from Stage 1 completeness profiles. If only single-point cross-sectional data is present without historical trajectory, confidence is mathematically capped at &le;35%, preventing alarming single readings from triggering false certainty.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#1A1C1E] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <CheckCircle className="w-3.5 h-3.5 text-[#137333]" />
              2. Two-Point Sustained Trajectory Invariant
            </h4>
            <p className="text-[#5F6368]">
              Emergency sirens require verified multi-point deterioration (&ge;2 data points in an escalating trajectory). Single outliers trigger <em>diagnostic collection requests</em> rather than emergency alarms, drastically reducing alarm fatigue in intensive care and triage settings.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#1A1C1E] text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
              <FileCode className="w-3.5 h-3.5 text-[#5F6368]" />
              3. Synthetic &amp; De-Identified Data Safety
            </h4>
            <p className="text-[#5F6368]">
              All preset patient records and telemetry entries are strictly synthetic benchmarks designed for demonstration. No protected health information (PHI) is processed or transmitted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#F8F9FA] border-t border-[#E0E2E6] px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1A1C1E] hover:bg-[#2D3135] text-white text-xs font-mono font-medium uppercase tracking-wider px-4 py-1.5 rounded-xs cursor-pointer transition-colors"
          >
            I Understand &bull; Return to Platform
          </button>
        </div>
      </div>
    </div>
  );
};
