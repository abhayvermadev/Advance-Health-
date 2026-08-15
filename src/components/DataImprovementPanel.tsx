import React from 'react';
import {
  ListPlus,
  ArrowUpRight,
  Sparkles,
  ClipboardList,
  AlertCircle,
  Stethoscope,
  PlusCircle,
} from 'lucide-react';
import { ClinicalRecommendation, MissingDataRequest } from '../types/clinical';

interface DataImprovementPanelProps {
  recommendation: ClinicalRecommendation;
  confidenceCapped: boolean;
  confidenceScore: number;
  onAddParameter?: (paramName: string) => void;
}

export const DataImprovementPanel: React.FC<DataImprovementPanelProps> = ({
  recommendation,
  confidenceCapped,
  confidenceScore,
  onAddParameter,
}) => {
  const dataImprovementList = recommendation?.dataImprovementList || [];
  const actionSteps = recommendation?.actionSteps || [];
  const urgencyLevel = recommendation?.urgencyLevel || 'routine';
  const headline = recommendation?.headline || 'Standard Clinical Monitoring';

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]';
      case 'recommended':
        return 'bg-[#FEF7E0] text-[#B06000] border-[#FCE293]';
      case 'routine':
      default:
        return 'bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]';
    }
  };

  return (
    <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs p-4 space-y-4">
      {/* Action Steps Header */}
      <div>
        <div className="flex items-center justify-between border-b border-[#E0E2E6] pb-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xs bg-[#E6F4EA] text-[#137333]">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
                Stage 5 &bull; Clinical Care Pathway &amp; Action Plan
              </h3>
              <p className="text-[11px] text-[#6D7278]">
                Calibrated to Composite Risk and Independent Confidence Level
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#1A1C1E] bg-[#F1F3F4] border border-[#DADCE0] px-2 py-0.5 rounded-xs uppercase">
            {urgencyLevel.replace('_', ' ')}
          </span>
        </div>

        {/* Action Steps List */}
        <div className="space-y-2">
          {actionSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 bg-[#F8F9FA] border border-[#E0E2E6] p-2.5 rounded-xs text-xs text-[#1A1C1E]"
            >
              <span className="w-4 h-4 rounded-xs bg-[#1A1C1E] text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Concrete Missing Data Panel */}
      <div className="pt-2 border-t border-[#E0E2E6]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-xs bg-[#FEF7E0] text-[#B06000]">
              <ListPlus className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
                What Specific Data Would Improve This Assessment?
              </h4>
              <p className="text-[11px] text-[#6D7278]">
                {confidenceCapped
                  ? `Current confidence (${confidenceScore}%) is constrained by missing markers. Collecting these tests will unlock full model certainty.`
                  : 'Targeted physiological inputs to refine monitoring and rule out compounding etiologies.'}
              </p>
            </div>
          </div>
        </div>

        {dataImprovementList.length === 0 ? (
          <div className="p-3 text-center text-xs text-[#80868B] bg-[#F8F9FA] rounded-xs border border-[#E0E2E6] font-mono">
            Sufficient comprehensive parameters recorded for this tier.
          </div>
        ) : (
          <div className="space-y-2">
            {dataImprovementList.map((req, idx) => (
              <div
                key={idx}
                className="bg-[#F8F9FA] hover:bg-white border border-[#E0E2E6] rounded-xs p-3 text-xs transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A1C1E] text-xs">
                      {req.parameterName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-xs border ${getPriorityBadge(
                        req.clinicalPriority
                      )}`}
                    >
                      {req.clinicalPriority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#137333] bg-[#E6F4EA] border border-[#CEEAD6] px-2 py-0.5 rounded-xs">
                      <Sparkles className="w-3 h-3 text-[#188038]" />
                      {req.confidenceImpact}
                    </span>
                    {onAddParameter && (
                      <button
                        type="button"
                        onClick={() => onAddParameter(req.parameterName)}
                        className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#1967D2] hover:text-white bg-[#E8F0FE] hover:bg-[#1967D2] border border-[#ADCCF9] px-2 py-0.5 rounded-xs transition-colors cursor-pointer"
                        title="Add this recommended reading to the patient record"
                      >
                        <PlusCircle className="w-3 h-3" />
                        <span>RECORD</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[#3C4043] text-xs leading-relaxed">
                  <strong className="text-[#1A1C1E]">Clinical Rationale: </strong>
                  {req.rationale}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
