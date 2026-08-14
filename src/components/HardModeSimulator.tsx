import React, { useState } from 'react';
import { PatientRecord, FullAssessmentResult } from '../types/clinical';
import {
  ShieldAlert,
  Zap,
  Sliders,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Database,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';

interface HardModeSimulatorProps {
  record: PatientRecord;
  assessment: FullAssessmentResult;
  onApplyPresetCondition: (type: 'sparse' | 'transient_spike' | 'sustained_decline' | 'restore') => void;
}

export const HardModeSimulator: React.FC<HardModeSimulatorProps> = ({
  record,
  assessment,
  onApplyPresetCondition,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="bg-white border border-[#DADCE0] rounded-xs overflow-hidden shadow-xs" id="hard-mode-simulator">
      {/* Accordion / Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#1A1C1E] text-white p-3.5 flex items-center justify-between hover:bg-[#282B2E] transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-[#E37400] text-white rounded-xs flex items-center justify-center font-bold text-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                HACKATHON HARD MODE &amp; FALSE ALARM SUPPRESSION LAB
              </span>
              <span className="text-[10px] font-mono bg-[#E37400]/30 text-[#FDD663] border border-[#E37400]/50 px-1.5 py-0.2 rounded-xs">
                INTERACTIVE BENCHMARK
              </span>
            </div>
            <p className="text-[11px] text-[#9AA0A6]">
              Test mechanical confidence capping on missing parameters, sensor drops, and transient spike vs. sustained trajectory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#8AB4F8]">
            {isOpen ? '▲ Collapse Lab' : '▼ Open Benchmark Lab'}
          </span>
        </div>
      </button>

      {/* Expanded Simulator Controls */}
      {isOpen && (
        <div className="p-4 bg-[#F8F9FA] border-t border-[#DADCE0] space-y-4 text-xs animate-in fade-in duration-150">
          {/* Conceptual Invariant Explanation */}
          <div className="bg-[#E8F0FE] border border-[#ADCCF9] rounded-xs p-3 text-[11px] leading-relaxed text-[#1A1C1E]">
            <div className="flex items-center gap-1.5 font-bold text-[#1967D2] mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Core Architectural Defense Invariant (Track 03 Hard Mode):</span>
            </div>
            <p>
              Incomplete, sparse, or single-point observations <strong>MUST NOT</strong> trigger premature emergency code alarms. Instead, our deterministic 5-stage engine automatically measures coverage (Vitals {assessment.stage1Completeness.vitalCoveragePercent}%, Labs {assessment.stage1Completeness.labCoveragePercent}%), caps confidence at <strong>{assessment.stage1Completeness.mechanicalConfidenceScore}%</strong>, and triggers targeted diagnostic acquisition requests.
            </p>
          </div>

          {/* 4 Interactive Test Scenarios */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[#5F6368] font-mono mb-2 block">
              Simulate Clinical Data Conditions (1-Click Benchmarks):
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Test 1: Sparse Data */}
              <button
                type="button"
                onClick={() => onApplyPresetCondition('sparse')}
                className="bg-white hover:bg-[#F1F3F4] border border-[#DADCE0] p-3 rounded-xs text-left transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1A1C1E]">1. Sensor Drop / Sparse</span>
                  <Database className="w-3.5 h-3.5 text-[#E37400]" />
                </div>
                <p className="text-[10px] text-[#5F6368] leading-tight">
                  Strip 70% of vital and lab streams to evaluate low-coverage confidence capping.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#E37400] font-bold">
                  Expected: Confidence &lt; 30% [Capped]
                </div>
              </button>

              {/* Test 2: Transient Spike */}
              <button
                type="button"
                onClick={() => onApplyPresetCondition('transient_spike')}
                className="bg-white hover:bg-[#F1F3F4] border border-[#DADCE0] p-3 rounded-xs text-left transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1A1C1E]">2. Transient Isolated Spike</span>
                  <AlertTriangle className="w-3.5 h-3.5 text-[#D93025]" />
                </div>
                <p className="text-[10px] text-[#5F6368] leading-tight">
                  Inject single HR 135 bpm reading with no prior trajectory to test false-alarm suppression.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#188038] font-bold">
                  Expected: RRT Alert SUPPRESSED
                </div>
              </button>

              {/* Test 3: Sustained Decline */}
              <button
                type="button"
                onClick={() => onApplyPresetCondition('sustained_decline')}
                className="bg-white hover:bg-[#F1F3F4] border border-[#DADCE0] p-3 rounded-xs text-left transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1A1C1E]">3. Sustained Multi-Point</span>
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D93025]" />
                </div>
                <p className="text-[10px] text-[#5F6368] leading-tight">
                  Provide 3 consecutive worsening readings across multiple systems satisfying safety rules.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#D93025] font-bold">
                  Expected: RRT Alert CONFIRMED (High Conf)
                </div>
              </button>

              {/* Test 4: Restore Baseline */}
              <button
                type="button"
                onClick={() => onApplyPresetCondition('restore')}
                className="bg-white hover:bg-[#F1F3F4] border border-[#1967D2] p-3 rounded-xs text-left transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#1967D2]">4. Re-calibrate Rich Record</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#188038]" />
                </div>
                <p className="text-[10px] text-[#5F6368] leading-tight">
                  Restore comprehensive multi-point longitudinal record with full lab workup.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#1967D2] font-bold">
                  Expected: High Confidence Baseline
                </div>
              </button>
            </div>
          </div>

          {/* Live Gating Telemetry Strip */}
          <div className="bg-white border border-[#DADCE0] p-3 rounded-xs flex flex-wrap items-center justify-between gap-4 font-mono text-[11px]">
            <div>
              <span className="text-[9px] uppercase text-[#5F6368] block">Vital Coverage</span>
              <span className="font-bold text-[#1A1C1E]">{assessment.stage1Completeness.vitalCoveragePercent}%</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#5F6368] block">Lab Coverage</span>
              <span className="font-bold text-[#1A1C1E]">{assessment.stage1Completeness.labCoveragePercent}%</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#5F6368] block">Temporal Depth</span>
              <span className="font-bold text-[#1A1C1E]">{assessment.stage1Completeness.temporalDepthScore}%</span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#5F6368] block">Confidence Level</span>
              <span
                className={`font-bold ${
                  assessment.stage3Risk.confidenceCapApplied ? 'text-[#E37400]' : 'text-[#188038]'
                }`}
              >
                {assessment.stage3Risk.confidenceScore}% ({assessment.stage3Risk.confidenceLevel.toUpperCase()})
                {assessment.stage3Risk.confidenceCapApplied && ' [CAPPED]'}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase text-[#5F6368] block">Emergency Rule Evaluated</span>
              <span className="text-[#1A1C1E] font-medium text-[10px] max-w-xs truncate block">
                {assessment.stage5Recommendation.emergencyRuleEvaluated}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
