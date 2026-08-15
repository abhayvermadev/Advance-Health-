import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { FullAssessmentResult, RiskLevel, ConfidenceLevel } from '../types/clinical';

interface RiskConfidenceDisplayProps {
  assessment: FullAssessmentResult;
  isLimitedMode: boolean;
}

export const RiskConfidenceDisplay: React.FC<RiskConfidenceDisplayProps> = ({
  assessment,
  isLimitedMode,
}) => {
  const [showCompletenessDetails, setShowCompletenessDetails] = useState<boolean>(false);

  if (!assessment || !assessment.stage3Risk) {
    return null;
  }

  const { stage1Completeness, stage3Risk, stage5Recommendation } = assessment;

  // Risk styling helpers
  const getRiskDetails = (level: RiskLevel) => {
    switch (level) {
      case 'critical':
        return {
          textColor: 'text-[#D93025]',
          badgeBg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          barColor: 'bg-[#D93025]',
          label: 'CRITICAL RISK',
          sub: 'Immediate Clinical Action',
        };
      case 'high':
        return {
          textColor: 'text-[#D93025]',
          badgeBg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          barColor: 'bg-[#D93025]',
          label: 'HIGH RISK',
          sub: 'Elevating Trajectory',
        };
      case 'moderate':
        return {
          textColor: 'text-[#E67E22]',
          badgeBg: 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]',
          barColor: 'bg-[#F2994A]',
          label: 'MODERATE RISK',
          sub: 'Subacute Drift',
        };
      case 'low':
      default:
        return {
          textColor: 'text-[#188038]',
          badgeBg: 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]',
          barColor: 'bg-[#34A853]',
          label: 'LOW RISK',
          sub: 'Stable Baseline',
        };
    }
  };

  // Confidence styling helpers
  const getConfidenceDetails = (level: ConfidenceLevel, capped: boolean) => {
    switch (level) {
      case 'high':
        return {
          textColor: 'text-[#1967D2]',
          badgeBg: 'bg-[#E8F0FE] text-[#1967D2] border-[#ADCCF9]',
          barColor: 'bg-[#1967D2]',
          label: 'HIGH CONFIDENCE',
          sub: 'Multi-Point Verified',
        };
      case 'moderate':
        return {
          textColor: 'text-[#E67E22]',
          badgeBg: 'bg-[#FFF4E5] text-[#A65E00] border-[#FFD399]',
          barColor: 'bg-[#F2994A]',
          label: 'MODERATE CONFIDENCE',
          sub: capped ? 'Capped (Missing Labs)' : 'Partial Coverage',
        };
      case 'low':
      default:
        return {
          textColor: 'text-[#C5221F]',
          badgeBg: 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]',
          barColor: 'bg-[#D93025]',
          label: 'LOW CONFIDENCE',
          sub: capped ? 'Capped (Sparse Telemetry)' : 'Sparse Data',
        };
    }
  };

  const riskInfo = getRiskDetails(stage3Risk.riskLevel);
  const confInfo = getConfidenceDetails(
    stage3Risk.confidenceLevel,
    stage3Risk.confidenceCapApplied
  );

  return (
    <div className="space-y-3" id="risk-confidence-dual-display">
      {/* 1. Contextual Status Banner */}
      {stage5Recommendation.isEmergencyAlert ? (
        <div className="bg-[#D93025] text-white p-3.5 border border-[#B3261E] rounded-xs shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-xs font-mono">
                EMERGENCY ALERT &bull; RAPID RESPONSE
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-white/90">
              Window: {stage5Recommendation.followUpWindow}
            </span>
          </div>
          <h3 className="text-sm font-bold text-white mt-0.5">
            {stage5Recommendation.headline}
          </h3>
          <p className="text-xs text-white/90 mt-1 font-mono">
            {stage5Recommendation.emergencyRuleEvaluated}
          </p>
        </div>
      ) : (stage3Risk.riskLevel === 'high' || stage3Risk.riskLevel === 'critical') &&
        stage3Risk.confidenceLevel === 'low' ? (
        <div className="bg-[#FFF4E5] border border-[#FFD399] p-3 rounded-xs text-[#855B1B] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#E67E22]"></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A65E00] font-mono">
                FALSE-ALARM SUPPRESSION ACTIVE
              </span>
            </div>
            <span className="text-[10px] font-mono bg-white/80 px-1.5 py-0.5 rounded-xs text-[#855B1B] border border-[#FFD399]">
              SIREN MUTED
            </span>
          </div>
          <p className="text-xs text-[#5F3B08]">
            High-risk parameter detected on low confidence/single-point data. Safety rules require repeat verification before emergency alarm.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#E0E2E6] px-3 py-2 rounded-xs text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#188038]" />
            <span className="text-xs text-[#3C4043]">
              <strong>Clinical Guardrail Active:</strong> Multi-point longitudinal trajectory required for critical alarms.
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#5F6368] bg-[#F1F3F4] px-1.5 py-0.5 rounded-xs">
            TEE Safe
          </span>
        </div>
      )}

      {/* 2. Primary Dual KPI Cards (Risk & Independent Confidence) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CARD A: Predicted Deterioration Risk */}
        <div className="bg-white p-4 border border-[#E0E2E6] shadow-xs rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#6D7278] uppercase tracking-wider">
                Deterioration Risk
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${riskInfo.badgeBg}`}
              >
                {riskInfo.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-bold tracking-tight ${riskInfo.textColor}`}>
                {stage3Risk.riskScore}
              </span>
              <span className="text-xs font-mono font-bold text-[#6D7278]">
                / 100 ({riskInfo.sub})
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F1F3F4] h-1.5 mt-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${riskInfo.barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, stage3Risk.riskScore))}%` }}
              ></div>
            </div>
          </div>

          {stage3Risk.deteriorationSyndromeSuspected && (
            <div className="mt-2.5 pt-2 border-t border-[#F1F3F4] text-xs text-[#3C4043] flex items-center justify-between">
              <span className="text-[11px] text-[#5F6368]">Pattern:</span>
              <span className="font-mono text-xs font-bold text-[#1A1C1E]">
                {stage3Risk.deteriorationSyndromeSuspected}
              </span>
            </div>
          )}
        </div>

        {/* CARD B: Mechanical Assessment Confidence */}
        <div className="bg-white p-4 border border-[#E0E2E6] shadow-xs rounded-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#6D7278] uppercase tracking-wider">
                Assessment Confidence
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-xs border ${confInfo.badgeBg}`}
              >
                {confInfo.label}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-4xl font-bold tracking-tight ${confInfo.textColor}`}>
                {stage3Risk.confidenceScore}%
              </span>
              <span className="text-xs font-mono font-bold text-[#6D7278]">
                ({confInfo.sub})
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#F1F3F4] h-1.5 mt-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ${confInfo.barColor}`}
                style={{ width: `${Math.min(100, Math.max(5, stage3Risk.confidenceScore))}%` }}
              ></div>
            </div>
          </div>

          {stage1Completeness.confidenceCappedReason ? (
            <div className="mt-2.5 pt-2 border-t border-[#F1F3F4] text-xs text-[#A65E00] flex items-center gap-1.5 truncate">
              <Lock className="w-3 h-3 text-[#E67E22] shrink-0" />
              <span className="truncate text-[11px] font-medium">
                <strong>Capped: </strong>
                {stage1Completeness.confidenceCappedReason}
              </span>
            </div>
          ) : (
            <div className="mt-2.5 pt-2 border-t border-[#F1F3F4] text-xs text-[#5F6368] flex items-center justify-between">
              <span className="text-[11px] text-[#5F6368]">Data Quality:</span>
              <span className="font-mono text-xs font-bold text-[#188038]">
                Multi-Point Verified
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Collapsible Data Completeness Profile Meter */}
      <div className="bg-white border border-[#E0E2E6] rounded-xs shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCompletenessDetails(!showCompletenessDetails)}
          className="w-full p-3 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-[#1967D2]" />
            <span className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wide">
              Data Completeness Profile
            </span>
            <span className="text-[10px] font-mono font-bold bg-[#F1F3F4] text-[#5F6368] px-1.5 py-0.2 rounded-xs border border-[#DADCE0]">
              {stage1Completeness.overallCoveragePercent}% Coverage
            </span>
          </div>

          <div className="flex items-center gap-2 text-[#5F6368]">
            <span className="text-[10px] font-mono font-medium hidden sm:inline">
              {showCompletenessDetails ? 'Hide Details' : 'View Breakdown'}
            </span>
            {showCompletenessDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showCompletenessDetails && (
          <div className="p-3 pt-0 border-t border-[#E0E2E6] bg-[#FCFCFD] text-xs animate-in fade-in duration-100">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5">
              <div className="p-2 bg-white border border-[#E0E2E6] rounded-xs text-center">
                <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Vital Coverage</span>
                <span className="text-xs font-mono font-bold text-[#1A1C1E]">
                  {stage1Completeness.vitalCoveragePercent}%
                </span>
              </div>

              <div className="p-2 bg-white border border-[#E0E2E6] rounded-xs text-center">
                <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Lab Biomarkers</span>
                <span className="text-xs font-mono font-bold text-[#1A1C1E]">
                  {stage1Completeness.labCoveragePercent}%
                </span>
              </div>

              <div className="p-2 bg-white border border-[#E0E2E6] rounded-xs text-center">
                <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Temporal Depth</span>
                <span className="text-xs font-mono font-bold text-[#1A1C1E]">
                  {stage1Completeness.temporalDepthScore} / 45
                </span>
              </div>

              <div className="p-2 bg-white border border-[#E0E2E6] rounded-xs text-center">
                <span className="text-[10px] font-bold text-[#6D7278] uppercase block">Cap Trigger</span>
                <span
                  className={`text-xs font-mono font-bold ${
                    stage1Completeness.confidenceCappedReason ? 'text-[#C5221F]' : 'text-[#188038]'
                  }`}
                >
                  {stage1Completeness.confidenceCappedReason ? 'Active' : 'Uncapped'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
