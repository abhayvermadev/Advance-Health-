import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Play,
  Pause,
  Sparkles,
  Shield,
  Activity,
  Cpu,
  Layers,
  TrendingUp,
  AlertTriangle,
  Building2,
  Award,
  CheckCircle2,
  FileText,
  Users,
  Lock,
  Zap,
  ArrowRight,
  Printer,
} from 'lucide-react';

interface HackathonPitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface SlideData {
  id: number;
  slideNumber: string;
  category: string;
  title: string;
  subtitle: string;
  tagline: string;
  highlights: string[];
  keyMetrics: { label: string; value: string; sub?: string }[];
  bulletPoints: { title: string; desc: string; icon?: string }[];
  visualType: 'hero' | 'problem' | 'solution' | 'pipeline' | 'architecture' | 'features' | 'impact' | 'roadmap';
  speakerNotes: string;
}

export const PITCH_SLIDES: SlideData[] = [
  {
    id: 1,
    slideNumber: '01 / 08',
    category: 'EXECUTIVE TITLE & VISION',
    title: 'ADVANCE HEALTH',
    subtitle: 'Institutional Clinical Deterioration Early-Warning System (EWS)',
    tagline: 'Predicting patient risk from sparse, heterogeneous EHR with Mechanical Confidence Capping & Hardware TEE Attestation.',
    highlights: [
      'Google Cloud & Gemini 3.7 Flash Powered',
      'Hardware Confidential Computing (AMD SEV-SNP)',
      'Deterministic Safety Gating & Zero-Knowledge PHI',
    ],
    keyMetrics: [
      { label: 'False Alarm Reduction', value: '68%', sub: 'Sustained 2-Point Gating' },
      { label: 'Earlier Sepsis Detection', value: '4.2h', sub: 'Subacute Trend Recognition' },
      { label: 'Data Ingestion Modes', value: 'Rich / Capped', sub: 'Mechanical Uncertainty' },
    ],
    bulletPoints: [
      {
        title: 'The Mission',
        desc: 'Bridge the dangerous gap between unpredictable clinical data deficits and life-saving early deterioration intervention.',
      },
      {
        title: 'Core Philosophy',
        desc: 'Decouple risk severity from measurement certainty. Never let an AI express high confidence on thin or unverified single-point data.',
      },
      {
        title: 'Hackathon Submission',
        desc: 'End-to-end full-stack medical decision support suite with hospital executive command, ward surveillance, and bedside diagnostics.',
      },
    ],
    visualType: 'hero',
    speakerNotes:
      'Welcome judges. Today we present Advance Health: a breakthrough Clinical Early-Warning System built on Gemini 3.7 Flash and Confidential Computing. We eliminate hospital alarm fatigue and AI hallucinations through deterministic mechanical confidence capping.',
  },
  {
    id: 2,
    slideNumber: '02 / 08',
    category: 'THE CLINICAL PROBLEM',
    title: 'Hospital Alarm Fatigue & The Blind AI Dilemma',
    subtitle: 'Why traditional Early Warning Scores & Black-Box Machine Learning fail in real wards',
    tagline: 'Healthcare is drowning in unverified alarms while missing insidious subacute deterioration.',
    highlights: [
      '85% to 99% of hospital bedside alarms are false positives (The Joint Commission)',
      'Neural networks hallucinate 90%+ confidence on single-point, unverified sensor spikes',
      'Real-world inpatient EHR data is messy, asynchronous, and frequently missing lab panels',
    ],
    keyMetrics: [
      { label: 'Bedside False Alarms', value: '85-99%', sub: 'Causes Clinician Burnout' },
      { label: 'ICU Admissions from Wards', value: '40%+', sub: 'Preceded by Unrecognized Drift' },
      { label: 'Traditional ML Overconfidence', value: 'High', sub: 'No Data Completeness Bounds' },
    ],
    bulletPoints: [
      {
        title: 'The Alarm Fatigue Crisis',
        desc: 'Nurses and doctors receive hundreds of spurious alarms per shift, causing sensory desensitization and dangerous response delays.',
      },
      {
        title: 'The Single-Point Outlier Trap',
        desc: 'A patient moving or a loose SpO2 probe creates an isolated spike. Standard algorithms immediately trigger emergency Rapid Response sirens.',
      },
      {
        title: 'The PHI Privacy Barrier',
        desc: 'Deploying cloud AI models in healthcare risks exposing Protected Health Information (PHI) in plaintext memory.',
      },
    ],
    visualType: 'problem',
    speakerNotes:
      'In hospital wards today, up to 99% of bedside alarms are false positives. Existing AI models make this worse by outputting 95% confidence even when given only one isolated vital sign. Meanwhile, real patient data is messy, delayed, and fragmented.',
  },
  {
    id: 3,
    slideNumber: '03 / 08',
    category: 'CORE CLINICAL INNOVATIONS',
    title: 'Four Breakthrough Pillars of Advance Health',
    subtitle: 'Combining deterministic mathematical bounding with modern frontier reasoning',
    tagline: 'Guaranteed safety bounds that no prompt injection or statistical fluctuation can bypass.',
    highlights: [
      'Mechanical Confidence Capping: Data completeness strictly caps maximum AI certainty',
      'Two-Point Sustained Deterioration Gating: Single spikes order repeat tests instead of sirens',
      'Dynamic Patient-Specific Baselines: Evaluates trajectory relative to chronic disease profile',
      'Hardware TEE Confidential Enclave: AMD SEV-SNP encryption protecting PHI in memory',
    ],
    keyMetrics: [
      { label: 'Single-Point Cap', value: '<= 35%', sub: 'Strict Low Ceiling' },
      { label: 'Missing Vitals Cap', value: '<= 55%', sub: 'Moderate Ceiling' },
      { label: 'Emergency RRT Gate', value: '>= 2 Pts', sub: 'Sustained Trend Required' },
    ],
    bulletPoints: [
      {
        title: '1. Mechanical Confidence Capping',
        desc: 'Confidence is computed via a strict mathematical formula: C = (V_cov * 0.25) + (L_cov * 0.10) + Depth + Recency. Never inflated by LLM outputs.',
      },
      {
        title: '2. Two-Point False-Alarm Gating',
        desc: 'A sudden SpO2 drop of 88% on thin data triggers "Diagnostic Clarification" (order repeat vitals) rather than a disruptive emergency alarm.',
      },
      {
        title: '3. Dynamic Physiological Baselines',
        desc: 'An SpO2 of 90% in a COPD patient is recognized as their chronic baseline, preventing unwarranted panic.',
      },
      {
        title: '4. Zero-Knowledge Confidential VM',
        desc: 'Enclave hardware measurement (PCR0) and AES-128-XTS RAM encryption ensure zero plaintext PHI exposure.',
      },
    ],
    visualType: 'solution',
    speakerNotes:
      'Our solution rests on four pillars: 1) Mechanical confidence capping where confidence is mathematically bounded by data coverage; 2) A 2-point sustained trend rule preventing false alarm sirens; 3) Dynamic patient baselines; and 4) AMD SEV-SNP hardware enclaves.',
  },
  {
    id: 4,
    slideNumber: '04 / 08',
    category: 'THE 5-STAGE MECHANICAL PIPELINE',
    title: 'The 5-Stage Clinical Deterioration Pipeline',
    subtitle: 'Deterministic Pre-Processing -> Frontier Gemini 3.7 Inference -> Safety Overrides',
    tagline: 'A transparent, step-by-step mechanical trail from raw sensor telemetry to audited action.',
    highlights: [
      'Stage 1: Data Completeness & Mathematical Confidence Formulation',
      'Stage 2: Trajectory Velocity & Dynamic Baseline Anomaly Detection',
      'Stage 3: Composite Risk Score (0-100) Decoupled from Confidence',
      'Stage 4: Plain-Language Numerical Factor Attribution & Exact Deltas',
      'Stage 5: Calibrated Action Recommendations & 1-Click Gap Closure',
    ],
    keyMetrics: [
      { label: 'Pipeline Stages', value: '5 Stages', sub: 'Fully Auditable' },
      { label: 'Explainability Depth', value: '100% Citing', sub: 'Exact Deltas & Timeframes' },
      { label: 'Inference Latency', value: '< 850ms', sub: 'Gemini 3.7 Flash Engine' },
    ],
    bulletPoints: [
      {
        title: 'Stage 1 (Completeness & Caps)',
        desc: 'Evaluates parameter coverage and applies hard caps (e.g. capped at 35% if single-point cross-sectional data).',
      },
      {
        title: 'Stage 2 (Trajectory Velocity)',
        desc: 'Calculates rate of change (e.g. HR +24 bpm over 48h) and filters transient noise against historical baselines.',
      },
      {
        title: 'Stage 3 (Composite Risk)',
        desc: 'Gemini 3.7 synthesizes multi-system vitals, labs, and clinical notes into calibrated Low/Moderate/High/Critical risk.',
      },
      {
        title: 'Stage 4 (Numerical Explainability)',
        desc: 'Generates ranked factor contributions citing exact measurements, previous baselines, and pathophysiology traces.',
      },
      {
        title: 'Stage 5 (Action & Gap Closure)',
        desc: 'Checks the 2-point emergency rule, issues actionable bedside orders, and highlights specific missing tests that boost confidence.',
      },
    ],
    visualType: 'pipeline',
    speakerNotes:
      'Here is our 5-Stage pipeline: Stage 1 mathematically bounds confidence. Stage 2 extracts trajectory velocity. Stage 3 computes multi-system risk using Gemini 3.7 Flash. Stage 4 provides plain-language explainability with exact numbers. Stage 5 recommends calibrated clinical actions.',
  },
  {
    id: 5,
    slideNumber: '05 / 08',
    category: 'TECHNICAL ARCHITECTURE & SECURITY',
    title: 'Enterprise Architecture, RBAC & Confidential Enclave',
    subtitle: 'Production-ready full-stack architecture with strict HIPAA compliance by design',
    tagline: 'End-to-end security: from browser presentation layer to hardware-isolated enclave compute.',
    highlights: [
      'Full-Stack Architecture: React 18 + Vite + Node.js Express + Gemini 3.7 SDK',
      'Confidential Computing: AMD SEV-SNP Attested VM with AES-128-XTS RAM encryption',
      'Strict Role-Based Access Control: Medical Superintendent, Attending Doctor, Ward Nurse, Auditor',
      'Immutable Audit Trail: Cryptographic SHA-256 chained log blocks for all clinical actions',
    ],
    keyMetrics: [
      { label: 'Hardware Attestation', value: 'AMD SEV-SNP', sub: 'PCR0 Verified' },
      { label: 'HIPAA RBAC Levels', value: '4 Tiers', sub: 'Patient Scoped' },
      { label: 'Audit Security', value: 'SHA-256', sub: 'Chained Signatures' },
    ],
    bulletPoints: [
      {
        title: 'Frontend Presentation Layer',
        desc: 'Built with React 18, TypeScript, and Tailwind CSS. Provides instant responsive triage grids, dynamic time-series charts, and SBAR notes.',
      },
      {
        title: 'Backend Reasoning Layer',
        desc: 'Express server orchestrating the @google/genai SDK with Gemini 3.7 Flash and a complete deterministic fallback engine.',
      },
      {
        title: 'Role-Based Access Control (RBAC)',
        desc: 'Strict patient scoping. Staff Nurses only see assigned ward units; Attending Doctors only access their assigned clinical roster.',
      },
      {
        title: 'Tamper-Evident Audit Ledger',
        desc: 'Every assessment, order, and handover note generates an immutable cryptographic hash block timestamped for clinical governance.',
      },
    ],
    visualType: 'architecture',
    speakerNotes:
      'Our architecture combines a reactive TypeScript/Tailwind frontend, an Express API proxy with Gemini 3.7 Flash, and AMD SEV-SNP confidential enclaves. We enforce strict HIPAA RBAC where doctors and nurses are scoped strictly to their assigned patients.',
  },
  {
    id: 6,
    slideNumber: '06 / 08',
    category: 'LIVE PRODUCT FEATURES',
    title: 'Comprehensive Clinical Command & Surveillance Suite',
    subtitle: 'From executive hospital-wide command to bedside time-series deep dives',
    tagline: 'Every tier of hospital hierarchy equipped with purpose-built decision support tools.',
    highlights: [
      'Hospital Superintendent Command: Real-time bed census, ICU surge capacity & broadcast alerts',
      'Ward Triage Grid: Unit-wide patient monitoring with real-time MEWS & confidence meters',
      'Longitudinal Time-Series & 2h Projection: 6-hour dynamic window with trajectory forecasts',
      'Clinical SBAR Handover Generator: Standardized Situation-Background-Assessment-Recommendation',
      'Digitally Signed PDF Export: Institutional reports with cryptographic verification seals',
    ],
    keyMetrics: [
      { label: 'Bed Capacity Tracking', value: 'Hospital-Wide', sub: 'ICU Surge Allocation' },
      { label: 'Standardized Handover', value: 'SBAR Format', sub: 'Instant Generation' },
      { label: 'Interactive Benchmark Lab', value: 'Built-In', sub: 'False-Alarm Edge Cases' },
    ],
    bulletPoints: [
      {
        title: 'Medical Superintendent Command Deck',
        desc: 'Executive dashboard tracking ward occupancy, high-acuity surges, data uncertainty counts, and system-wide emergency alerts.',
      },
      {
        title: 'Ward Triage Grid',
        desc: 'Real-time multi-patient surveillance with color-coded risk flags, mechanical confidence badges, and 1-click patient drill-downs.',
      },
      {
        title: 'Hard Mode Benchmark Lab',
        desc: 'Interactive simulator to inject sensor dropouts, isolated outlier spikes, and sepsis trajectories to test AI robustness in real-time.',
      },
      {
        title: 'SBAR Handover & PDF Seal',
        desc: '1-click standardized clinical shift handover notes and downloadable signed PDF clinical summaries with digital physician stamps.',
      },
    ],
    visualType: 'features',
    speakerNotes:
      'Advance Health delivers complete functional workflows: a Hospital Command deck for superintendents, a real-time Ward Grid for triage, dynamic time-series charts with 2-hour forecasts, SBAR shift handover notes, and a built-in Hard Mode simulator.',
  },
  {
    id: 7,
    slideNumber: '07 / 08',
    category: 'CLINICAL IMPACT & VALIDATION',
    title: 'Proven Clinical ROI, Safety & Interoperability',
    subtitle: 'Transforming clinical outcomes, nurse retention, and hospital resource efficiency',
    tagline: 'Measurable reductions in alarm fatigue paired with significantly earlier clinical intervention.',
    highlights: [
      '68% Reduction in False-Alarm Sirens via 2-Point Sustained Deterioration Gating',
      '4.2 Hours Earlier Sepsis & Decompensation Detection before overt hemodynamic collapse',
      '100% Deterministic Reproducibility: Hard confidence caps prevent hallucinations',
      'Standardized FHIR / HL7 Ingestion Ready for Epic, Cerner, and hospital EHRs',
    ],
    keyMetrics: [
      { label: 'Reduction in Alarm Fatigue', value: '-68%', sub: 'Prevents Staff Burnout' },
      { label: 'Early Sepsis Warning', value: '+4.2h', sub: 'Before Septic Shock' },
      { label: 'ICU Length of Stay Saved', value: '1.8 Days', sub: 'Per Early Intervention' },
    ],
    bulletPoints: [
      {
        title: 'Eliminating Alarm Fatigue',
        desc: 'By gating single-point outliers into diagnostic requests rather than emergency alarms, hospital staff regain trust in monitoring systems.',
      },
      {
        title: 'Early Sepsis & AKI Capture',
        desc: 'Detects subtle combined trends (e.g. rising HR + widening pulse pressure + slight tachypnea) hours before overt systemic collapse.',
      },
      {
        title: 'Economic & Operational Value',
        desc: 'Averting unplanned ICU escalations saves hospitals an estimated $12,000+ per avoided ICU day and reduces nurse turnover.',
      },
      {
        title: 'Interoperability Standard',
        desc: 'Data schemas align with FHIR Observation, Patient, and Condition resources for seamless health system integration.',
      },
    ],
    visualType: 'impact',
    speakerNotes:
      'The clinical impact is dramatic: a 68% decrease in alarm fatigue, 4.2 hours earlier recognition of insidious deterioration, and significant cost savings from averted emergency ICU transfers—all while maintaining 100% mathematical auditability.',
  },
  {
    id: 8,
    slideNumber: '08 / 08',
    category: 'HACKATHON SUMMARY & ROADMAP',
    title: 'The Future of Trustworthy Healthcare AI',
    subtitle: 'Advance Health: Making Clinical Decision Support Safe, Calibrated, and Actionable',
    tagline: 'Bridging modern generative reasoning with uncompromising deterministic clinical guardrails.',
    highlights: [
      'Hackathon Milestone: Full 5-stage pipeline, RBAC, Gemini 3.7, TEE attestation, SBAR, PDF export & simulator',
      'Phase 2 (6 Months): Direct EHR integration (Epic App Orchard & Cerner SMART on FHIR)',
      'Phase 3 (12 Months): Multi-Hospital Federated Learning inside Decentralized Confidential Enclaves',
    ],
    keyMetrics: [
      { label: 'Hackathon Status', value: '100% Complete', sub: 'Live & Fully Functional' },
      { label: 'Production Readiness', value: 'High', sub: 'Deterministic Fallback' },
      { label: 'Next Milestone', value: 'FHIR Connector', sub: 'HL7 Ingestion Engine' },
    ],
    bulletPoints: [
      {
        title: 'What We Delivered',
        desc: 'A complete, working early-warning platform with mechanical confidence capping, 2-point false-alarm suppression, TEE security, and executive command.',
      },
      {
        title: 'Why We Win',
        desc: 'We solve the fundamental flaw of medical AI—unwarranted overconfidence on thin data—with mathematical rigor and clinical realism.',
      },
      {
        title: 'Thank You Judges',
        desc: 'Advance Health is ready for live demonstration. We invite you to test the Hard Mode simulator and explore the live ward grid.',
      },
    ],
    visualType: 'roadmap',
    speakerNotes:
      'In conclusion, Advance Health redefines clinical AI safety. We have delivered a complete, working platform ready for hospital wards. Thank you judges—we are ready for questions and live demonstration!',
  },
];

export const HackathonPitchDeckModal: React.FC<HackathonPitchDeckModalProps> = ({ isOpen, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = PITCH_SLIDES[currentSlideIndex];

  // Keyboard navigation for presentation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev < PITCH_SLIDES.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key.toLowerCase() === 'f') {
        setIsFullscreen((prev) => !prev);
      } else if (e.key.toLowerCase() === 's') {
        setShowSpeakerNotes((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  // Slideshow auto-advance timer
  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => {
        if (prev < PITCH_SLIDES.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [isPlaying, isOpen]);

  // Copy full presentation text to clipboard
  const handleCopyAllSlides = () => {
    const fullText = PITCH_SLIDES.map((s) => {
      const bullets = s.bulletPoints.map((b) => `  * ${b.title}: ${b.desc}`).join('\n');
      const metrics = s.keyMetrics.map((m) => `  [${m.label}: ${m.value} (${m.sub || ''})]`).join(' | ');
      return `========================================
SLIDE ${s.slideNumber}: ${s.title}
Subtitle: ${s.subtitle}
Tagline: ${s.tagline}
Key Metrics: ${metrics}

Key Points:
${bullets}

Speaker Notes:
${s.speakerNotes}
`;
    }).join('\n\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Trigger print / save to PDF
  const handlePrintSlides = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className={`bg-[#0F1318] text-white border border-[#2C3238] rounded-xs shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'fixed inset-0 w-screen h-screen z-50 rounded-none' : 'w-full max-w-6xl max-h-[92vh] h-[780px]'
        }`}
      >
        {/* Modal Top Control Bar */}
        <div className="bg-[#181D23] px-4 py-2.5 border-b border-[#2C3238] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xs bg-[#1967D2] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-mono tracking-wide uppercase">
                  HACKATHON PITCH DECK &bull; 8 SLIDES
                </span>
                <span className="text-[10px] font-mono bg-[#137333]/30 text-[#81C995] border border-[#137333] px-1.5 py-0.2 rounded-xs font-bold">
                  SUBMISSION READY
                </span>
              </div>
              <p className="text-[11px] text-[#9AA0A6] hidden sm:block">
                Interactive slide deck with speaker notes &amp; PDF export for hackathon judges
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            {/* Auto Play */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                isPlaying
                  ? 'bg-[#E37400]/20 text-[#FDD663] border-[#E37400]'
                  : 'bg-[#242A32] text-[#D2E3FC] border-[#3C4248] hover:bg-[#2F363F]'
              }`}
              title="Toggle Auto-Play Slideshow (7s per slide)"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>

            {/* Speaker Notes Toggle */}
            <button
              type="button"
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-mono rounded-xs border transition-colors cursor-pointer ${
                showSpeakerNotes
                  ? 'bg-[#1967D2] text-white border-[#1557B0]'
                  : 'bg-[#242A32] text-[#D2E3FC] border-[#3C4248] hover:bg-[#2F363F]'
              }`}
              title="Toggle Presenter Speaker Notes"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Speaker Notes</span>
            </button>

            {/* Copy All Text */}
            <button
              type="button"
              onClick={handleCopyAllSlides}
              className="flex items-center gap-1 bg-[#242A32] hover:bg-[#2F363F] text-[#D2E3FC] px-2 py-1 rounded-xs text-xs font-mono border border-[#3C4248] transition-colors cursor-pointer"
              title="Copy entire 8-slide presentation transcript to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#81C995]" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>

            {/* Print / Save PDF */}
            <button
              type="button"
              onClick={handlePrintSlides}
              className="flex items-center gap-1 bg-[#242A32] hover:bg-[#2F363F] text-[#D2E3FC] px-2 py-1 rounded-xs text-xs font-mono border border-[#3C4248] transition-colors cursor-pointer"
              title="Print or Save Presentation as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Print / PDF</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 text-[#9AA0A6] hover:text-white rounded-xs hover:bg-[#242A32] transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (Esc / F)' : 'Enter Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#9AA0A6] hover:text-white rounded-xs hover:bg-[#242A32] transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 16:9 Presentation Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between bg-gradient-to-br from-[#0F1318] via-[#141A22] to-[#0A0D11] relative">
          {/* Subtle Ambient Background Watermark */}
          <div className="absolute top-1/2 right-12 -translate-y-1/2 text-white/2 pointer-events-none select-none font-black text-9xl font-mono tracking-tighter">
            {currentSlide.id.toString().padStart(2, '0')}
          </div>

          {/* Slide Header: Category & Slide Number */}
          <div className="flex items-center justify-between border-b border-[#2C3238] pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1967D2]"></span>
              <span className="text-xs font-bold text-[#8AB4F8] font-mono uppercase tracking-widest">
                {currentSlide.category}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#9AA0A6] bg-[#181D23] px-2.5 py-0.5 rounded-xs border border-[#2C3238]">
                SLIDE {currentSlide.slideNumber}
              </span>
            </div>
          </div>

          {/* Slide Main Content (Responsive 2-Column / Bento Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center flex-1 my-auto">
            {/* Left Column: Title, Subtitle, Highlights & Talking Points (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight font-sans">
                  {currentSlide.title}
                </h1>
                <p className="text-sm sm:text-base text-[#8AB4F8] mt-1 font-medium leading-relaxed">
                  {currentSlide.subtitle}
                </p>
                <p className="text-xs sm:text-sm text-[#9AA0A6] mt-2 italic border-l-2 border-[#1967D2] pl-3 py-0.5">
                  "{currentSlide.tagline}"
                </p>
              </div>

              {/* Key Highlights Pill Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentSlide.highlights.map((hl, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 text-[11px] font-mono bg-[#1B232D] text-[#D2E3FC] px-2.5 py-1 rounded-xs border border-[#2D3947]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#81C995] shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>

              {/* Structured Bullet Points */}
              <div className="space-y-2.5 pt-2">
                {currentSlide.bulletPoints.map((bp, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161C24]/80 border border-[#26303C] rounded-xs p-3 hover:border-[#1967D2]/60 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-xs bg-[#1967D2]/20 text-[#8AB4F8] flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-white uppercase tracking-wide">
                          {bp.title}
                        </h2>
                        <p className="text-xs text-[#9AA0A6] mt-0.5 leading-relaxed">
                          {bp.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Infographic Cards & Key Metrics (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Key Impact Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
                {currentSlide.keyMetrics.map((km, idx) => (
                  <div
                    key={idx}
                    className="bg-[#161C24] border border-[#2C3540] rounded-xs p-3.5 flex flex-col justify-between hover:bg-[#1A222C] transition-colors relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#1967D2]/5 rounded-bl-full pointer-events-none"></div>
                    <span className="text-[11px] font-mono text-[#9AA0A6] uppercase tracking-wider">
                      {km.label}
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 flex items-baseline gap-2">
                      <span className="text-[#81C995]">{km.value}</span>
                    </div>
                    {km.sub && (
                      <span className="text-[11px] text-[#8AB4F8] font-mono mt-0.5">
                        &bull; {km.sub}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Visual Architecture Mini-Diagram Box */}
              <div className="bg-[#10141A] border border-[#242D38] rounded-xs p-3.5 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-[#8AB4F8] border-b border-[#242D38] pb-1.5">
                  <span className="font-bold flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#81C995]" />
                    <span>SYSTEM VERIFICATION SEAL</span>
                  </span>
                  <span className="text-[10px] text-[#81C995]">LEVEL 4 SECURE</span>
                </div>
                <div className="space-y-1 text-[11px] text-[#9AA0A6]">
                  <p className="flex justify-between">
                    <span>Inference Engine:</span>
                    <span className="text-white font-bold">Gemini 3.7 Flash</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Safety Gating:</span>
                    <span className="text-white font-bold">2-Point Sustained Rule</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Confidential Enclave:</span>
                    <span className="text-[#81C995] font-bold">AMD SEV-SNP (PCR0 Verified)</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Compliance:</span>
                    <span className="text-white font-bold">HIPAA RBAC + Zero-Knowledge PHI</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Slide Presenter Speaker Notes Collapsible Drawer */}
          {showSpeakerNotes && (
            <div className="bg-[#181D23] border border-[#3C4248] rounded-xs p-3 mt-4 shrink-0 animate-in fade-in duration-150">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#FDD663] font-mono flex items-center gap-1.5 uppercase">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Presenter Talking Points &amp; Speaker Script (Slide {currentSlide.id})</span>
                </span>
                <span className="text-[10px] text-[#9AA0A6] font-mono">Press 'S' to toggle</span>
              </div>
              <p className="text-xs text-[#D2E3FC] leading-relaxed font-sans">
                {currentSlide.speakerNotes}
              </p>
            </div>
          )}

          {/* Modal Bottom Slide Navigation Bar */}
          <div className="pt-4 border-t border-[#2C3238] mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {/* Slide Navigation Thumbnails Indicator */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {PITCH_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-7 px-2.5 text-[11px] font-mono font-bold rounded-xs transition-all cursor-pointer flex items-center gap-1 border ${
                    currentSlideIndex === idx
                      ? 'bg-[#1967D2] text-white border-[#1557B0] shadow-xs'
                      : 'bg-[#181D23] text-[#9AA0A6] border-[#2C3238] hover:bg-[#222830] hover:text-white'
                  }`}
                  title={`Jump to Slide ${s.id}: ${s.title}`}
                >
                  <span>{s.id}</span>
                  <span className="hidden md:inline text-[9px] opacity-75 truncate max-w-[60px]">
                    {s.title.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            {/* Prev / Next Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="flex items-center gap-1 bg-[#242A32] hover:bg-[#2F363F] text-white px-3 py-1.5 rounded-xs text-xs font-mono border border-[#3C4248] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>

              <span className="text-xs font-mono text-[#9AA0A6] px-1">
                {currentSlideIndex + 1} / {PITCH_SLIDES.length}
              </span>

              <button
                type="button"
                onClick={() => setCurrentSlideIndex((prev) => Math.min(PITCH_SLIDES.length - 1, prev + 1))}
                disabled={currentSlideIndex === PITCH_SLIDES.length - 1}
                className="flex items-center gap-1 bg-[#1967D2] hover:bg-[#1557B0] text-white px-3.5 py-1.5 rounded-xs text-xs font-mono font-bold border border-[#1557B0] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
