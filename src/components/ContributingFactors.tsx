import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  FileCheck,
  Terminal,
} from 'lucide-react';
import { ExplainabilityReport, ContributingFactor } from '../types/clinical';

interface ContributingFactorsProps {
  explainability: ExplainabilityReport;
}

export const ContributingFactors: React.FC<ContributingFactorsProps> = ({ explainability }) => {
  const { topContributingFactors, summary, patientContextConsiderations } = explainability;

  const getWeightBadge = (weight: string) => {
    switch (weight?.toLowerCase()) {
      case 'critical':
        return 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]';
      case 'high':
        return 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]';
      case 'moderate':
        return 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]';
      case 'mild':
      default:
        return 'bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]';
    }
  };

  return (
    <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E0E2E6] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xs bg-[#E8F0FE] text-[#1967D2]">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
              Stage 4 &bull; Clinical Explainability &amp; Factor Attribution
            </h3>
            <p className="text-[11px] text-[#6D7278]">
              Traceable input attribution citing exact measured values &amp; longitudinal deltas
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#1967D2] bg-[#E8F0FE] border border-[#ADCCF9] px-2 py-0.5 rounded-xs">
          {topContributingFactors.length} RANKED DRIVERS
        </span>
      </div>

      {/* Terminal Style AI Clinical Synthesis */}
      <div className="bg-[#1A1C1E] text-white p-4 rounded-xs border border-[#2D3135] shadow-inner space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#8AB4F8] uppercase tracking-widest">
            <Terminal className="w-3.5 h-3.5" />
            <span>AI CLINICAL RATIONALE ENGINE</span>
          </div>
          <span className="text-[10px] font-mono text-[#80868B]">STAGE 4 SYNTHESIS</span>
        </div>
        <p className="text-xs text-[#E8EAED] font-mono leading-relaxed">{summary}</p>
        {patientContextConsiderations && (
          <div className="pt-2 border-t border-[#3C4043] text-xs font-mono text-[#9AA0A6]">
            <strong className="text-[#8AB4F8]">PATIENT CONTEXT: </strong>
            {patientContextConsiderations}
          </div>
        )}
      </div>

      {/* Ranked Contributing Factors List */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D7278] block">
          Ranked Physiological Deterioration Drivers
        </span>

        {topContributingFactors.length === 0 ? (
          <div className="p-4 text-center text-xs text-[#80868B] bg-[#F8F9FA] rounded-xs border border-dashed border-[#E0E2E6] font-mono">
            No acute deterioration anomalies identified in the recorded parameters.
          </div>
        ) : (
          topContributingFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#F8F9FA] hover:bg-white border border-[#E0E2E6] rounded-xs transition-colors text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-xs bg-[#1A1C1E] text-white font-mono font-bold flex items-center justify-center text-[10px]">
                    {factor.rank || idx + 1}
                  </span>
                  <span className="font-bold text-[#1A1C1E] text-xs">
                    {factor.parameterName}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs border ${getWeightBadge(
                      factor.impactWeight
                    )}`}
                  >
                    {factor.impactWeight}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5F6368] bg-white border border-[#E0E2E6] px-2 py-0.5 rounded-xs">
                  <span>Base: {factor.baselineOrPrevious}</span>
                  <ArrowRight className="w-3 h-3 text-[#80868B]" />
                  <span className="font-bold text-[#1A1C1E]">Now: {factor.observedValue}</span>
                </div>
              </div>

              {/* Exact Traceable Statement */}
              <div className="text-[#3C4043] pl-6 text-xs leading-snug">
                {factor.clinicalTrace}
              </div>

              {factor.timeframe && (
                <div className="pl-6 mt-1 text-[10px] text-[#80868B] font-mono">
                  Observed Window: {factor.timeframe}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
