import React, { useState, useEffect } from 'react';
import { PatientRecord, FullAssessmentResult, UserProfile } from '../types/clinical';
import { ClipboardCheck, Copy, Check, FileText, AlertTriangle, Activity, User, Stethoscope, X } from 'lucide-react';

interface SbarHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PatientRecord;
  assessment: FullAssessmentResult;
  currentUser: UserProfile;
}

export const SbarHandoverModal: React.FC<SbarHandoverModalProps> = ({
  isOpen,
  onClose,
  record,
  assessment,
  currentUser,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

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

  const situation = `Patient ${record.patient.name || record.patient.id} (${record.patient.age}yo ${record.patient.sex}) is currently assessed at ${assessment.stage3Risk.riskLevel.toUpperCase()} RISK (${assessment.stage3Risk.riskScore}/100) with ${assessment.stage3Risk.confidenceLevel.toUpperCase()} CONFIDENCE (${assessment.stage3Risk.confidenceScore}%). ${
    assessment.stage5Recommendation.isEmergencyAlert
      ? 'EMERGENCY RRT ALERT ACTIVE due to sustained multi-system physiological decline.'
      : assessment.stage3Risk.confidenceCapApplied
      ? 'Note: Confidence is mechanically capped due to limited or single-point observations.'
      : 'Patient is under surveillance for potential subacute trajectory.'
  }`;

  const background = `Known conditions: ${
    record.patient.knownConditions.length > 0 ? record.patient.knownConditions.join(', ') : 'None documented'
  }. Active medications: ${
    record.patient.medications.length > 0 ? record.patient.medications.join(', ') : 'None active'
  }. Qualitative intake notes: "${record.patient.notes || 'No qualitative notes recorded.'}"`;

  const topFactors = assessment.stage4Explainability.topContributingFactors
    .slice(0, 3)
    .map((f) => `${f.parameterName} (${f.observedValue} vs baseline ${f.baselineOrPrevious}): ${f.clinicalTrace}`)
    .join('; ');

  const clinicalAssessment = `Suspected Clinical Syndrome: ${assessment.stage3Risk.deteriorationSyndromeSuspected || 'Physiological Surveillance'}. Primary drivers: ${
    topFactors || 'All monitored parameters within expected limits.'
  } Mechanical Confidence Breakdown: Vital Coverage ${assessment.stage1Completeness.vitalCoveragePercent}%, Lab Coverage ${
    assessment.stage1Completeness.labCoveragePercent
  }%, Temporal Depth ${assessment.stage1Completeness.temporalDepthScore}%.`;

  const recommendation = `Urgency Level: ${assessment.stage5Recommendation.urgencyLevel.replace('_', ' ').toUpperCase()}. Immediate action steps: ${assessment.stage5Recommendation.actionSteps.join(
    '; '
  )}. Diagnostic priorities: ${assessment.stage5Recommendation.dataImprovementList.map((d) => d.parameterName).join(', ')}. Follow-up window: ${
    assessment.stage5Recommendation.followUpWindow
  }. Prepared by: ${currentUser.name} (${currentUser.roleTitle}).`;

  const fullSbarText = `=== CLINICAL SBAR HANDOVER REPORT ===
PATIENT: ${record.patient.name || record.patient.id} | ID: ${record.patient.id}
PREPARED BY: ${currentUser.name} (${currentUser.badgeNumber}) - ${currentUser.roleTitle}
DATE/TIME: ${new Date().toLocaleString()}

[S] SITUATION:
${situation}

[B] BACKGROUND:
${background}

[A] ASSESSMENT:
${clinicalAssessment}

[R] RECOMMENDATION:
${recommendation}
======================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullSbarText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        className="w-full max-w-3xl bg-white rounded-xs shadow-2xl border border-[#DADCE0] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 cursor-default"
        id="sbar-handover-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1A1C1E] text-white p-4 border-b border-[#3C4043] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1967D2] rounded-xs flex items-center justify-center text-white">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight uppercase">
                  CLINICAL SBAR SHIFT HANDOVER GENERATOR
                </h2>
                <span className="text-[10px] font-mono bg-[#1967D2]/30 text-[#8AB4F8] border border-[#1967D2]/50 px-1.5 py-0.2 rounded-xs">
                  EHR READY
                </span>
              </div>
              <p className="text-[11px] text-[#9AA0A6]">
                Situation • Background • Assessment • Recommendation structured transfer note
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Situation */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-3.5">
            <div className="flex items-center gap-2 font-bold text-[#1967D2] text-[11px] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 bg-[#1967D2] text-white rounded-xs flex items-center justify-center text-xs">S</span>
              <span>Situation</span>
            </div>
            <p className="text-[#1A1C1E] leading-relaxed font-mono">{situation}</p>
          </div>

          {/* Background */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-3.5">
            <div className="flex items-center gap-2 font-bold text-[#5F6368] text-[11px] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 bg-[#5F6368] text-white rounded-xs flex items-center justify-center text-xs">B</span>
              <span>Background</span>
            </div>
            <p className="text-[#1A1C1E] leading-relaxed font-mono">{background}</p>
          </div>

          {/* Assessment */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-3.5">
            <div className="flex items-center gap-2 font-bold text-[#E37400] text-[11px] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 bg-[#E37400] text-white rounded-xs flex items-center justify-center text-xs">A</span>
              <span>Assessment &amp; Trajectory Drivers</span>
            </div>
            <p className="text-[#1A1C1E] leading-relaxed font-mono">{clinicalAssessment}</p>
          </div>

          {/* Recommendation */}
          <div className="bg-[#F8F9FA] border border-[#DADCE0] rounded-xs p-3.5">
            <div className="flex items-center gap-2 font-bold text-[#188038] text-[11px] uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 bg-[#188038] text-white rounded-xs flex items-center justify-center text-xs">R</span>
              <span>Recommendation &amp; Interventions</span>
            </div>
            <p className="text-[#1A1C1E] leading-relaxed font-mono">{recommendation}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F9FA] border-t border-[#DADCE0] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#5F6368] font-mono">
            Signed by: <strong className="text-[#1A1C1E]">{currentUser.name}</strong> ({currentUser.badgeNumber})
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-[#DADCE0] text-[#3C4043] hover:bg-[#F1F3F4] text-xs font-medium rounded-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-[#1967D2] hover:bg-[#185ABC] text-white px-4 py-1.5 rounded-xs text-xs font-medium tracking-tight shadow-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy SBAR for EHR'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
