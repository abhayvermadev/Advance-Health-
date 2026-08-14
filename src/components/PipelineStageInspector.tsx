import React, { useState } from 'react';
import { Layers, Code, CheckCircle2, ChevronRight, Sparkles, Shield, Cpu, Activity } from 'lucide-react';
import { FullAssessmentResult } from '../types/clinical';

interface PipelineStageInspectorProps {
  assessment: FullAssessmentResult;
}

export const PipelineStageInspector: React.FC<PipelineStageInspectorProps> = ({ assessment }) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const stages = [
    {
      num: 1,
      name: 'Data Completeness Assessment',
      subtitle: 'Deterministic Profile & Confidence Baseline',
      icon: <Layers className="w-4 h-4 text-[#137333]" />,
      content: assessment.stage1Completeness,
      render: (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] rounded-xs text-[#137333]">
            <span className="font-bold">Stage 1 Output:</span> Deterministic completeness profiling executed before risk reasoning. Evaluates parameter coverage ({assessment.stage1Completeness.overallCoveragePercent}%), temporal depth score ({assessment.stage1Completeness.temporalDepthScore}/45), and establishes the confidence ceiling ({assessment.stage1Completeness.mechanicalConfidenceScore}%).
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white p-2 rounded-xs border border-[#E0E2E6] text-center">
              <span className="text-[#80868B] block text-[10px] font-bold uppercase">Vital Coverage</span>
              <span className="text-xs font-mono font-bold text-[#1A1C1E]">{assessment.stage1Completeness.vitalCoveragePercent}%</span>
            </div>
            <div className="bg-white p-2 rounded-xs border border-[#E0E2E6] text-center">
              <span className="text-[#80868B] block text-[10px] font-bold uppercase">Lab Coverage</span>
              <span className="text-xs font-mono font-bold text-[#1A1C1E]">{assessment.stage1Completeness.labCoveragePercent}%</span>
            </div>
            <div className="bg-white p-2 rounded-xs border border-[#E0E2E6] text-center">
              <span className="text-[#80868B] block text-[10px] font-bold uppercase">Recorded Count</span>
              <span className="text-xs font-mono font-bold text-[#1A1C1E]">{assessment.stage1Completeness.recordedParametersCount}</span>
            </div>
            <div className="bg-white p-2 rounded-xs border border-[#E0E2E6] text-center">
              <span className="text-[#80868B] block text-[10px] font-bold uppercase">Confidence Cap</span>
              <span className="text-xs font-mono font-bold text-[#A65E00]">{assessment.stage1Completeness.confidenceCappedReason ? 'Active' : 'Uncapped'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      num: 2,
      name: 'Trend & Anomaly Detection',
      subtitle: 'Patient-Specific Baseline Comparison',
      icon: <Activity className="w-4 h-4 text-[#D93025]" />,
      content: assessment.stage2Trends,
      render: (
        <div className="space-y-2 text-xs">
          <p className="text-[#5F6368] mb-2 text-xs">
            Evaluated parameter trajectory against patient baseline, distinguishing true deterioration from normal variation:
          </p>
          <div className="space-y-2">
            {assessment.stage2Trends.map((t, idx) => (
              <div key={idx} className="p-2.5 bg-white border border-[#E0E2E6] rounded-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1A1C1E]">{t.parameterName}</span>
                  <p className="text-[11px] text-[#6D7278]">{t.deltaSummary}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-xs border uppercase ${t.isAnomaly ? 'bg-[#FCE8E6] text-[#C5221F] border-[#F5C2C7]' : 'bg-[#F1F3F4] text-[#5F6368] border-[#DADCE0]'}`}>
                  {t.trajectory.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: 3,
      name: 'Composite Risk & Confidence Coupling',
      subtitle: 'Mechanically Coupled Dual Metrics',
      icon: <Shield className="w-4 h-4 text-[#1967D2]" />,
      content: assessment.stage3Risk,
      render: (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-[#E0E2E6] rounded-xs">
              <span className="text-[10px] font-bold uppercase text-[#80868B]">Risk Metric</span>
              <div className="text-lg font-mono font-bold text-[#1A1C1E] mt-1">{assessment.stage3Risk.riskScore} / 100 ({assessment.stage3Risk.riskLevel.toUpperCase()})</div>
            </div>
            <div className="p-3 bg-white border border-[#E0E2E6] rounded-xs">
              <span className="text-[10px] font-bold uppercase text-[#80868B]">Coupled Confidence</span>
              <div className="text-lg font-mono font-bold text-[#1967D2] mt-1">{assessment.stage3Risk.confidenceScore}% ({assessment.stage3Risk.confidenceLevel.toUpperCase()})</div>
            </div>
          </div>
          <p className="text-[#3C4043] bg-white p-2.5 rounded-xs border border-[#E0E2E6] text-xs">
            <strong className="text-[#1A1C1E]">Coupling Theorem:</strong> Confidence cannot be artificially elevated by acute risk numbers. It is mechanically bounded by Stage 1 completeness.
          </p>
        </div>
      ),
    },
    {
      num: 4,
      name: 'Explainability & Factor Attribution',
      subtitle: 'Ranked Traceable Input Attribution',
      icon: <Sparkles className="w-4 h-4 text-[#E67E22]" />,
      content: assessment.stage4Explainability,
      render: (
        <div className="space-y-2 text-xs">
          <p className="text-[#3C4043] bg-white p-2.5 rounded-xs border border-[#E0E2E6]">
            {assessment.stage4Explainability.summary}
          </p>
          <div className="space-y-1.5 mt-2">
            {assessment.stage4Explainability.topContributingFactors.map((f, i) => (
              <div key={i} className="p-2 bg-white border border-[#E0E2E6] rounded-xs text-xs font-mono">
                <strong className="text-[#1A1C1E]">#{f.rank} {f.parameterName}:</strong> {f.clinicalTrace}
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: 5,
      name: 'Recommendation & False-Alarm Gating',
      subtitle: 'Calibrated Action & Data Asks',
      icon: <Cpu className="w-4 h-4 text-[#1A1C1E]" />,
      content: assessment.stage5Recommendation,
      render: (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-white border border-[#E0E2E6] rounded-xs">
            <span className="font-bold text-[#1A1C1E] block mb-1 uppercase tracking-wider text-[10px]">Emergency Rule Outcome:</span>
            <p className="text-[#3C4043]">{assessment.stage5Recommendation.emergencyRuleEvaluated}</p>
          </div>
          <div className="p-2.5 bg-white border border-[#E0E2E6] rounded-xs">
            <span className="font-bold text-[#1A1C1E] block mb-1 uppercase tracking-wider text-[10px]">Primary Clinical Directive:</span>
            <p className="text-[#3C4043]">{assessment.stage5Recommendation.headline}</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xs border border-[#E0E2E6] shadow-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E0E2E6] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-xs bg-[#F1F3F4] text-[#1A1C1E]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1C1E]">
              5-Stage Structured Pipeline Inspector
            </h3>
            <p className="text-[11px] text-[#6D7278]">
              Deterministic Schema Hand-off at Every Clinical Reasoning Phase
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRawJson(!showRawJson)}
          className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#1967D2] hover:text-[#174EA6] bg-[#E8F0FE] border border-[#ADCCF9] px-2.5 py-1 rounded-xs cursor-pointer"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{showRawJson ? 'VIEW STAGE UI' : 'VIEW RAW JSON'}</span>
        </button>
      </div>

      {/* Stage Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
        {stages.map((st) => (
          <button
            key={st.num}
            type="button"
            onClick={() => setActiveStage(st.num)}
            className={`p-2 rounded-xs border text-left transition-colors cursor-pointer ${
              activeStage === st.num
                ? 'bg-[#1A1C1E] border-[#1A1C1E] text-white shadow-xs'
                : 'bg-[#F8F9FA] border-[#E0E2E6] text-[#1A1C1E] hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5 font-mono">
              <span>Stage {st.num}</span>
            </div>
            <div className={`text-[10px] truncate ${activeStage === st.num ? 'text-[#9AA0A6]' : 'text-[#6D7278]'}`}>
              {st.name}
            </div>
          </button>
        ))}
      </div>

      {/* Stage Body */}
      <div className="bg-[#F8F9FA] p-3.5 rounded-xs border border-[#E0E2E6]">
        {showRawJson ? (
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#80868B] block uppercase tracking-wider">
              Stage {activeStage} Schema Payload:
            </span>
            <pre className="bg-[#1A1C1E] text-[#D1D3D6] p-3.5 rounded-xs text-[11px] font-mono overflow-x-auto max-h-72 border border-[#2D3135]">
              {JSON.stringify(stages[activeStage - 1].content, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              {stages[activeStage - 1].icon}
              <h4 className="text-xs font-bold text-[#1A1C1E] uppercase tracking-wider font-mono">
                Stage {activeStage}: {stages[activeStage - 1].name}
              </h4>
            </div>
            {stages[activeStage - 1].render}
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#80868B] pt-2 border-t border-[#F1F3F4] uppercase tracking-wider">
        <span>Engine: {assessment.meta.modelUsed}</span>
        <span>Latency: {assessment.meta.processingTimeMs}ms</span>
        <span>Timestamp: {new Date(assessment.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
