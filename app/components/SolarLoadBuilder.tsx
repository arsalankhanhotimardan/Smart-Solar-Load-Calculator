"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Cpu,
  Factory,
  Gauge,
  GraduationCap,
  Home,
  Info,
  Maximize2,
  Mic,
  Minus,
  Plus,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  Stethoscope,
  Sun,
  TriangleAlert,
  Zap,
  Briefcase,
} from "lucide-react";
import {
  calculateSolarSystem,
  type BatteryChemistry,
  type ElectricalPhase,
  type SolarCoverageMode,
  type SolarPanelSpec,
  type SolarSystemType,
} from "../lib/solar-engine";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

type CatalogItem = {
  id: number;
  category?: string;
  category_title?: string;
  icon?: string;
  model_name: string;
  urdu_name?: string;
  watts: number | string;
  default_hours?: number | string;
  sub_sector?: string;
  surge_watts?: number | string | null;
  surge_multiplier?: number | string | null;
  power_factor?: number | string | null;
};

type PanelItem = {
  id: number;
  model_name: string;
  wattage: number | string;
  length_meters?: number | string | null;
  width_meters?: number | string | null;
};

interface SolarLoadBuilderProps {
  initialDomestic: CatalogItem[];
  initialCommercial: CatalogItem[];
  initialPanels: PanelItem[];
}

type LoadState = Record<number, { quantity: number; hoursPerDay: number }>;

type CustomLoad = {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hoursPerDay: number;
  surgeMultiplier: number;
};

type Workspace = {
  activeBranch: "domestic" | "commercial";
  commercialSubSector: "education" | "medical" | "industry" | "office" | null;
  systemPreference: SolarSystemType;
  coverageMode: SolarCoverageMode;
  selectedPanelId: number | "custom";
  customPanelWattage: number;
  customPanelLength: number;
  customPanelWidth: number;
  loadProfile: LoadState;
  customLoads: CustomLoad[];
  peakSunHours: number;
  systemLossPercent: number;
  inverterEfficiencyPercent: number;
  inverterHeadroomPercent: number;
  targetDcAcRatio: number;
  overallPowerFactor: number;
  unknownMotorSurgeMultiplier: number;
  simultaneousMotorStarts: number;
  backupHours: number;
  backupLoadPercent: number;
  batteryChemistry: BatteryChemistry;
  batteryVoltage: number;
  roofSpacingPercent: number;
  electricalPhase: ElectricalPhase;
};

const WORKSPACE_KEY = "greenengineering-solar-v2-workspace";

const num = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const round = (value: number, digits = 2) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : "N/A";

const defaultWorkspace = (panels: PanelItem[]): Workspace => ({
  activeBranch: "domestic",
  commercialSubSector: null,
  systemPreference: "hybrid",
  coverageMode: "balanced",
  selectedPanelId: panels.length ? Number(panels[0].id) : "custom",
  customPanelWattage: 550,
  customPanelLength: 2.28,
  customPanelWidth: 1.13,
  loadProfile: {},
  customLoads: [],
  peakSunHours: 5,
  systemLossPercent: 14,
  inverterEfficiencyPercent: 96,
  inverterHeadroomPercent: 25,
  targetDcAcRatio: 1.2,
  overallPowerFactor: 0.9,
  unknownMotorSurgeMultiplier: 2.5,
  simultaneousMotorStarts: 1,
  backupHours: 4,
  backupLoadPercent: 100,
  batteryChemistry: "lifepo4",
  batteryVoltage: 48,
  roofSpacingPercent: 15,
  electricalPhase: "single",
});

export default function SolarLoadBuilder({
  initialDomestic,
  initialCommercial,
  initialPanels,
}: SolarLoadBuilderProps) {
  const initial = defaultWorkspace(initialPanels);
  const [activeBranch, setActiveBranch] = useState<Workspace["activeBranch"]>(
    initial.activeBranch
  );
  const [commercialSubSector, setCommercialSubSector] = useState<
    Workspace["commercialSubSector"]
  >(null);
  const [activeStep, setActiveStep] = useState<
    "builder" | "preferences" | "recommendation"
  >("builder");
  const [systemPreference, setSystemPreference] = useState<SolarSystemType>(
    initial.systemPreference
  );
  const [coverageMode, setCoverageMode] = useState<SolarCoverageMode>(
    initial.coverageMode
  );
  const [selectedPanelId, setSelectedPanelId] = useState<number | "custom">(
    initial.selectedPanelId
  );
  const [customPanelWattage, setCustomPanelWattage] = useState(550);
  const [customPanelLength, setCustomPanelLength] = useState(2.28);
  const [customPanelWidth, setCustomPanelWidth] = useState(1.13);
  const [loadProfile, setLoadProfile] = useState<LoadState>({});
  const [customLoads, setCustomLoads] = useState<CustomLoad[]>([]);
  const [dropdownSelections, setDropdownSelections] = useState<
    Record<string, number>
  >({});
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);

  // Keep multi-step navigation intuitive on long pages. Whenever the user
  // changes calculator steps, bring the top of the calculator workflow back
  // into view instead of leaving the next screen below the fold.
  const stepTopRef = useRef<HTMLDivElement>(null);
  const previousStepRef = useRef(activeStep);

  const [peakSunHours, setPeakSunHours] = useState(5);
  const [systemLossPercent, setSystemLossPercent] = useState(14);
  const [inverterEfficiencyPercent, setInverterEfficiencyPercent] = useState(96);
  const [inverterHeadroomPercent, setInverterHeadroomPercent] = useState(25);
  const [targetDcAcRatio, setTargetDcAcRatio] = useState(1.2);
  const [overallPowerFactor, setOverallPowerFactor] = useState(0.9);
  const [unknownMotorSurgeMultiplier, setUnknownMotorSurgeMultiplier] =
    useState(2.5);
  const [simultaneousMotorStarts, setSimultaneousMotorStarts] = useState(1);
  const [backupHours, setBackupHours] = useState(4);
  const [backupLoadPercent, setBackupLoadPercent] = useState(100);
  const [batteryChemistry, setBatteryChemistry] =
    useState<BatteryChemistry>("lifepo4");
  const [batteryVoltage, setBatteryVoltage] = useState(48);
  const [roofSpacingPercent, setRoofSpacingPercent] = useState(15);
  const [electricalPhase, setElectricalPhase] =
    useState<ElectricalPhase>("single");

  const [customName, setCustomName] = useState("");
  const [customWatts, setCustomWatts] = useState("");
  const [customQuantity, setCustomQuantity] = useState("1");
  const [customHours, setCustomHours] = useState("4");
  const [customSurge, setCustomSurge] = useState("1");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(WORKSPACE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Workspace>;
        if (saved.activeBranch) setActiveBranch(saved.activeBranch);
        setCommercialSubSector(saved.commercialSubSector ?? null);
        if (saved.systemPreference) setSystemPreference(saved.systemPreference);
        if (saved.coverageMode) setCoverageMode(saved.coverageMode);
        if (
          saved.selectedPanelId === "custom" ||
          initialPanels.some((p) => Number(p.id) === Number(saved.selectedPanelId))
        ) {
          setSelectedPanelId(saved.selectedPanelId!);
        }
        if (saved.customPanelWattage) setCustomPanelWattage(saved.customPanelWattage);
        if (saved.customPanelLength) setCustomPanelLength(saved.customPanelLength);
        if (saved.customPanelWidth) setCustomPanelWidth(saved.customPanelWidth);
        if (saved.loadProfile) setLoadProfile(saved.loadProfile);
        if (Array.isArray(saved.customLoads)) setCustomLoads(saved.customLoads);
        if (saved.peakSunHours) setPeakSunHours(saved.peakSunHours);
        if (saved.systemLossPercent != null)
          setSystemLossPercent(saved.systemLossPercent);
        if (saved.inverterEfficiencyPercent)
          setInverterEfficiencyPercent(saved.inverterEfficiencyPercent);
        if (saved.inverterHeadroomPercent != null)
          setInverterHeadroomPercent(saved.inverterHeadroomPercent);
        if (saved.targetDcAcRatio) setTargetDcAcRatio(saved.targetDcAcRatio);
        if (saved.overallPowerFactor) setOverallPowerFactor(saved.overallPowerFactor);
        if (saved.unknownMotorSurgeMultiplier)
          setUnknownMotorSurgeMultiplier(saved.unknownMotorSurgeMultiplier);
        if (saved.simultaneousMotorStarts)
          setSimultaneousMotorStarts(saved.simultaneousMotorStarts);
        if (saved.backupHours) setBackupHours(saved.backupHours);
        if (saved.backupLoadPercent) setBackupLoadPercent(saved.backupLoadPercent);
        if (saved.batteryChemistry) setBatteryChemistry(saved.batteryChemistry);
        if (saved.batteryVoltage) setBatteryVoltage(saved.batteryVoltage);
        if (saved.roofSpacingPercent != null)
          setRoofSpacingPercent(saved.roofSpacingPercent);
        if (saved.electricalPhase) setElectricalPhase(saved.electricalPhase);
      }
    } catch (error) {
      console.warn("Solar workspace could not be restored.", error);
    } finally {
      setWorkspaceReady(true);
    }
  }, [initialPanels]);

  useEffect(() => {
    if (!workspaceReady) return;
    const workspace: Workspace = {
      activeBranch,
      commercialSubSector,
      systemPreference,
      coverageMode,
      selectedPanelId,
      customPanelWattage,
      customPanelLength,
      customPanelWidth,
      loadProfile,
      customLoads,
      peakSunHours,
      systemLossPercent,
      inverterEfficiencyPercent,
      inverterHeadroomPercent,
      targetDcAcRatio,
      overallPowerFactor,
      unknownMotorSurgeMultiplier,
      simultaneousMotorStarts,
      backupHours,
      backupLoadPercent,
      batteryChemistry,
      batteryVoltage,
      roofSpacingPercent,
      electricalPhase,
    };
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace));
      } catch (error) {
        console.warn("Solar workspace could not be saved.", error);
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [
    workspaceReady,
    activeBranch,
    commercialSubSector,
    systemPreference,
    coverageMode,
    selectedPanelId,
    customPanelWattage,
    customPanelLength,
    customPanelWidth,
    loadProfile,
    customLoads,
    peakSunHours,
    systemLossPercent,
    inverterEfficiencyPercent,
    inverterHeadroomPercent,
    targetDcAcRatio,
    overallPowerFactor,
    unknownMotorSurgeMultiplier,
    simultaneousMotorStarts,
    backupHours,
    backupLoadPercent,
    batteryChemistry,
    batteryVoltage,
    roofSpacingPercent,
    electricalPhase,
  ]);

  useEffect(() => {
    // Skip the initial render. Auto-scroll only after an actual step change.
    if (previousStepRef.current === activeStep) return;
    previousStepRef.current = activeStep;

    const frame = window.requestAnimationFrame(() => {
      stepTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeStep]);

  const visibleCatalog = useMemo(() => {
    if (activeBranch === "domestic") return initialDomestic;
    if (!commercialSubSector) return [];
    return initialCommercial.filter(
      (item) => String(item.sub_sector) === commercialSubSector
    );
  }, [activeBranch, commercialSubSector, initialDomestic, initialCommercial]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          visibleCatalog
            .map((item) => String(item.category || "other"))
            .filter(Boolean)
        )
      ),
    [visibleCatalog]
  );

  const catalogById = useMemo(() => {
    return new Map(
      [...initialDomestic, ...initialCommercial].map((item) => [
        Number(item.id),
        item,
      ])
    );
  }, [initialDomestic, initialCommercial]);

  const engineLoads = useMemo(() => {
    const catalogLoads = Object.entries(loadProfile)
      .map(([id, state]) => {
        const item = catalogById.get(Number(id));
        if (!item) return null;
        return {
          id: item.id,
          name: item.model_name,
          category: item.category || null,
          watts: num(item.watts),
          quantity: state.quantity,
          hoursPerDay: state.hoursPerDay,
          surgeWatts: item.surge_watts == null ? null : num(item.surge_watts),
          surgeMultiplier:
            item.surge_multiplier == null ? null : num(item.surge_multiplier),
          powerFactor:
            item.power_factor == null ? null : num(item.power_factor),
        };
      })
      .filter(Boolean) as any[];

    return [
      ...catalogLoads,
      ...customLoads.map((item) => ({
        id: item.id,
        name: item.name,
        category: "custom",
        watts: item.watts,
        quantity: item.quantity,
        hoursPerDay: item.hoursPerDay,
        surgeMultiplier: item.surgeMultiplier,
      })),
    ];
  }, [loadProfile, customLoads, catalogById]);

  const selectedPanel = useMemo<SolarPanelSpec | null>(() => {
    if (selectedPanelId === "custom") {
      if (!(customPanelWattage > 0)) return null;
      return {
        id: "custom",
        name: `Custom ${customPanelWattage}W panel`,
        wattage: customPanelWattage,
        lengthMeters: customPanelLength > 0 ? customPanelLength : null,
        widthMeters: customPanelWidth > 0 ? customPanelWidth : null,
      };
    }
    const panel = initialPanels.find((p) => Number(p.id) === Number(selectedPanelId));
    if (!panel) return null;
    return {
      id: panel.id,
      name: panel.model_name,
      wattage: num(panel.wattage),
      lengthMeters: panel.length_meters == null ? null : num(panel.length_meters),
      widthMeters: panel.width_meters == null ? null : num(panel.width_meters),
    };
  }, [
    selectedPanelId,
    initialPanels,
    customPanelWattage,
    customPanelLength,
    customPanelWidth,
  ]);

  const result = useMemo(
    () =>
      calculateSolarSystem(engineLoads, selectedPanel, {
        systemType: systemPreference,
        coverageMode,
        peakSunHours,
        systemLossPercent,
        inverterEfficiencyPercent,
        inverterHeadroomPercent,
        targetDcAcRatio,
        overallPowerFactor,
        unknownMotorSurgeMultiplier,
        simultaneousMotorStarts,
        backupHours,
        backupLoadPercent,
        batteryChemistry,
        batteryVoltage,
        roofSpacingPercent,
        electricalPhase,
      }),
    [
      engineLoads,
      selectedPanel,
      systemPreference,
      coverageMode,
      peakSunHours,
      systemLossPercent,
      inverterEfficiencyPercent,
      inverterHeadroomPercent,
      targetDcAcRatio,
      overallPowerFactor,
      unknownMotorSurgeMultiplier,
      simultaneousMotorStarts,
      backupHours,
      backupLoadPercent,
      batteryChemistry,
      batteryVoltage,
      roofSpacingPercent,
      electricalPhase,
    ]
  );

  const addAppliance = (item: CatalogItem) => {
    setLoadProfile((prev) => {
      const current = prev[item.id] || {
        quantity: 0,
        hoursPerDay: Math.max(0.5, Math.min(24, num(item.default_hours, 4))),
      };
      return {
        ...prev,
        [item.id]: { ...current, quantity: current.quantity + 1 },
      };
    });
  };

  const updateQty = (id: number, delta: number) => {
    setLoadProfile((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const quantity = Math.max(0, current.quantity + delta);
      if (!quantity) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...current, quantity } };
    });
  };

  const updateHours = (id: number, hours: number) => {
    setLoadProfile((prev) =>
      prev[id]
        ? {
            ...prev,
            [id]: {
              ...prev[id],
              hoursPerDay: Math.max(0.1, Math.min(24, hours)),
            },
          }
        : prev
    );
  };

  const addCustomLoad = () => {
    const watts = num(customWatts);
    const quantity = Math.max(1, Math.round(num(customQuantity, 1)));
    const hoursPerDay = Math.max(0.1, Math.min(24, num(customHours, 4)));
    const surgeMultiplier = Math.max(1, Math.min(6, num(customSurge, 1)));
    if (!customName.trim() || watts <= 0) return;
    setCustomLoads((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: customName.trim(),
        watts,
        quantity,
        hoursPerDay,
        surgeMultiplier,
      },
    ]);
    setCustomName("");
    setCustomWatts("");
    setCustomQuantity("1");
    setCustomHours("4");
    setCustomSurge("1");
  };

  const resetAll = () => {
    setLoadProfile({});
    setCustomLoads([]);
    setActiveStep("builder");
    try {
      localStorage.removeItem(WORKSPACE_KEY);
    } catch {}
  };

  const switchBranch = (branch: "domestic" | "commercial") => {
    setActiveBranch(branch);
    setActiveStep("builder");
    setLoadProfile({});
    setCustomLoads([]);
    setDropdownSelections({});
    if (branch === "commercial") {
      setCommercialSubSector(null);
      setElectricalPhase("three");
    } else {
      setElectricalPhase("single");
    }
  };

  const processVoiceCommand = (transcript: string) => {
    const normalized = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const numbers: Record<string, number> = {
      one: 1,
      aik: 1,
      ek: 1,
      two: 2,
      do: 2,
      three: 3,
      teen: 3,
      four: 4,
      char: 4,
      chaar: 4,
      five: 5,
      panch: 5,
      six: 6,
      che: 6,
      seven: 7,
      saat: 7,
      eight: 8,
      aath: 8,
      nine: 9,
      nau: 9,
      ten: 10,
      das: 10,
    };
    let added = 0;
    const words = normalized.split(/\s+/).filter(Boolean);
    for (let i = 0; i < words.length - 1; i += 1) {
      const qty = numbers[words[i]] || Number(words[i]);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      const phrase = words.slice(i + 1, i + 4).join(" ");
      const item = visibleCatalog.find((candidate) => {
        const haystack = `${candidate.model_name} ${candidate.category || ""}`.toLowerCase();
        return phrase.split(" ").some((word) => word.length > 2 && haystack.includes(word));
      });
      if (!item) continue;
      setLoadProfile((prev) => {
        const current = prev[item.id] || {
          quantity: 0,
          hoursPerDay: Math.max(0.5, Math.min(24, num(item.default_hours, 4))),
        };
        return {
          ...prev,
          [item.id]: { ...current, quantity: current.quantity + qty },
        };
      });
      added += 1;
    }
    setVoiceFeedback(
      added
        ? `Added ${added} appliance group${added === 1 ? "" : "s"} from voice input.`
        : `I could not match that command. Try “2 fans and 1 AC”.`
    );
    window.setTimeout(() => setVoiceFeedback(null), 4000);
  };

  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceFeedback("Voice input is not supported in this browser. You can still add loads manually.");
      window.setTimeout(() => setVoiceFeedback(null), 4000);
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) =>
      processVoiceCommand(event.results[0][0].transcript);
    recognition.onerror = () => {
      setVoiceFeedback("Microphone access was unavailable. Please add appliances manually.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const hasLoad = result.peakRunningKw > 0;

  return (
    <div className="relative mx-auto w-full max-w-6xl space-y-5 font-sans">
      {voiceFeedback && (
        <div className="fixed left-1/2 top-20 z-[70] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl border border-sky-500/50 bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-2xl">
          <div className="flex items-start gap-3">
            <Mic className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
            <span className="min-w-0 break-words">{voiceFeedback}</span>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Free planning calculator — no signup required
          </div>
          <span className="text-xs text-emerald-200/70">Your calculator workspace is saved only in this browser.</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-lg">
        <button
          type="button"
          onClick={() => switchBranch("domestic")}
          className={`min-h-12 rounded-xl px-3 py-3 text-sm font-bold transition ${
            activeBranch === "domestic"
              ? "bg-sky-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-2"><Home className="h-5 w-5" /> Home Solar</span>
        </button>
        <button
          type="button"
          onClick={() => switchBranch("commercial")}
          className={`min-h-12 rounded-xl px-3 py-3 text-sm font-bold transition ${
            activeBranch === "commercial"
              ? "bg-indigo-600 text-white"
              : "text-slate-400 hover:bg-slate-800 hover:text-white"
          }`}
        >
          <span className="flex items-center justify-center gap-2"><Building2 className="h-5 w-5" /> Commercial</span>
        </button>
      </div>

      <div
        ref={stepTopRef}
        className="scroll-mt-24 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Solar system designer</h2>
              <p className="text-xs text-slate-400">
                {activeStep === "builder" && "1. Build your load profile"}
                {activeStep === "preferences" && "2. Set solar and backup assumptions"}
                {activeStep === "recommendation" && "3. Review the engineering estimate"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["builder", "1. Load"],
              ["preferences", "2. System"],
              ["recommendation", "3. Results"],
            ].map(([key, label]) => {
              const disabled = key !== "builder" && !hasLoad;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setActiveStep(key as any)}
                  className={`min-h-11 rounded-xl px-3 py-2 text-xs font-black transition ${
                    activeStep === key
                      ? "bg-emerald-600 text-white"
                      : disabled
                      ? "cursor-not-allowed bg-slate-950/50 text-slate-700"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {activeBranch === "commercial" && !commercialSubSector && (
        <section className="rounded-2xl border border-indigo-500/30 bg-slate-900 p-5 shadow-xl sm:p-8">
          <div className="mb-7 text-center">
            <h2 className="text-2xl font-black text-white">Choose a commercial facility</h2>
            <p className="mt-2 text-sm text-slate-400">This filters the equipment catalog. You can still add any custom load.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["education", GraduationCap, "School / College / University", "Classrooms, labs and campus loads"],
              ["medical", Stethoscope, "Hospital / Clinic / Lab", "Clinical and support equipment"],
              ["industry", Factory, "Industry / Manufacturing", "Motors, process loads and machinery"],
              ["office", Briefcase, "Office / Plaza / Retail", "HVAC, IT, lighting and services"],
            ].map(([value, Icon, title, body]) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setCommercialSubSector(value as any)}
                className="min-h-40 rounded-2xl border border-slate-700 bg-slate-800/40 p-6 text-left transition hover:border-indigo-500 hover:bg-slate-800"
              >
                <Icon className="mb-4 h-10 w-10 text-indigo-400" />
                <h3 className="font-black text-white">{String(title)}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">{String(body)}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {(activeBranch === "domestic" || commercialSubSector) && activeStep === "builder" && (
        <section className="rounded-2xl border border-sky-500/20 bg-slate-900 p-4 shadow-xl sm:p-6">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {activeBranch === "commercial" && (
                <button
                  type="button"
                  onClick={() => setCommercialSubSector(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300"
                  aria-label="Change commercial sector"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-black text-white">Add the appliances you want to power</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">Wattage, quantity and daily operating hours drive the energy calculation. Starting surge is taken from catalog data when available, otherwise a visible planning assumption is used for motor/compressor loads.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startListening}
                className={`min-h-11 rounded-xl px-4 text-xs font-black text-white ${
                  isListening ? "bg-rose-500" : "bg-sky-600 hover:bg-sky-500"
                }`}
              >
                <span className="flex items-center gap-2"><Mic className="h-4 w-4" />{isListening ? "Listening…" : "Voice"}</span>
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Reset calculator"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {visibleCatalog.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {categories.map((category) => {
                const models = visibleCatalog.filter(
                  (item) => String(item.category || "other") === category
                );
                if (!models.length) return null;
                const selectedId = dropdownSelections[category] || Number(models[0].id);
                const activeItems = models.filter(
                  (item) => (loadProfile[item.id]?.quantity || 0) > 0
                );
                return (
                  <div key={category} className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/35">
                    <div className="p-4">
                      <div className="mb-3 flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-xl">{models[0].icon || "⚡"}</span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-black uppercase tracking-wide text-white">{models[0].category_title || category}</h3>
                          <p className="text-[11px] text-slate-500">Choose a model and add it to your load.</p>
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                        <select
                          value={selectedId}
                          onChange={(e) =>
                            setDropdownSelections((prev) => ({
                              ...prev,
                              [category]: Number(e.target.value),
                            }))
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-xs text-slate-200 outline-none focus:border-sky-500"
                        >
                          {models.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.model_name} ({num(item.watts)}W)
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const item = models.find((x) => Number(x.id) === selectedId);
                            if (item) addAppliance(item);
                          }}
                          className="min-h-11 shrink-0 rounded-xl bg-sky-600 px-5 text-xs font-black text-white hover:bg-sky-500"
                        >
                          <span className="flex items-center justify-center gap-1"><Plus className="h-4 w-4" /> Add</span>
                        </button>
                      </div>
                    </div>

                    {activeItems.length > 0 && (
                      <div className="space-y-3 border-t border-slate-800 bg-slate-900/50 p-4">
                        {activeItems.map((item) => {
                          const state = loadProfile[item.id];
                          return (
                            <div key={item.id} className="rounded-xl border border-slate-700 bg-slate-950 p-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="break-words text-xs font-black text-white">{item.model_name}</h4>
                                  <p className="mt-1 text-[11px] text-slate-400">{num(item.watts)} W{item.urdu_name ? ` • ${item.urdu_name}` : ""}</p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
                                  <button type="button" onClick={() => updateQty(item.id, -1)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300" aria-label={`Reduce ${item.model_name}`}><Minus className="h-4 w-4" /></button>
                                  <span className="w-8 text-center text-sm font-black text-sky-300">{state.quantity}</span>
                                  <button type="button" onClick={() => updateQty(item.id, 1)} className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300" aria-label={`Increase ${item.model_name}`}><Plus className="h-4 w-4" /></button>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center gap-3 border-t border-slate-800 pt-3">
                                <Clock className="h-4 w-4 shrink-0 text-amber-400" />
                                <input type="range" min="0.5" max="24" step="0.5" value={state.hoursPerDay} onChange={(e) => updateHours(item.id, Number(e.target.value))} className="min-w-0 flex-1 accent-amber-400" />
                                <span className="w-14 text-right text-xs font-black text-amber-300">{state.hoursPerDay} h</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              Appliance catalog data is unavailable for this selection. You can still use the custom-load form below.
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="font-black text-white">Add a custom appliance or machine</h3>
              <p className="mt-1 text-xs text-slate-400">Useful for worldwide users, new products, specialist equipment and catalog gaps.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Field label="Name"><input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Pool pump" className="solar-input" /></Field>
              <Field label="Running watts"><input type="number" min="1" value={customWatts} onChange={(e) => setCustomWatts(e.target.value)} placeholder="1200" className="solar-input" /></Field>
              <Field label="Quantity"><input type="number" min="1" value={customQuantity} onChange={(e) => setCustomQuantity(e.target.value)} className="solar-input" /></Field>
              <Field label="Hours / day"><input type="number" min="0.1" max="24" step="0.1" value={customHours} onChange={(e) => setCustomHours(e.target.value)} className="solar-input" /></Field>
              <Field label="Starting multiplier"><input type="number" min="1" max="6" step="0.1" value={customSurge} onChange={(e) => setCustomSurge(e.target.value)} className="solar-input" /></Field>
            </div>
            <button type="button" onClick={addCustomLoad} className="mt-4 min-h-11 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white hover:bg-emerald-500">+ Add custom load</button>
            {customLoads.length > 0 && (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {customLoads.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-xs">
                    <div className="min-w-0"><strong className="break-words text-white">{item.name}</strong><div className="mt-1 text-slate-400">{item.quantity} × {item.watts}W • {item.hoursPerDay} h/day • {item.surgeMultiplier}× start</div></div>
                    <button type="button" onClick={() => setCustomLoads((rows) => rows.filter((x) => x.id !== item.id))} className="shrink-0 rounded-lg px-3 py-2 font-bold text-rose-300 hover:bg-rose-500/10">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-800 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid flex-1 grid-cols-2 gap-2 sm:max-w-lg">
              <QuickMetric label="Running load" value={`${round(result.peakRunningKw, 2)} kW`} />
              <QuickMetric label="Daily energy" value={`${round(result.dailyEnergyKwh, 1)} kWh`} />
            </div>
            <button type="button" onClick={() => setActiveStep("preferences")} disabled={!hasLoad} className="min-h-12 w-full rounded-xl bg-sky-600 px-7 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-600 sm:w-auto">Next: System assumptions <ArrowRight className="ml-2 inline h-4 w-4" /></button>
          </div>
        </section>
      )}

      {(activeBranch === "domestic" || commercialSubSector) && activeStep === "preferences" && (
        <section className="mx-auto max-w-4xl rounded-2xl border border-indigo-500/25 bg-slate-900 p-4 shadow-xl sm:p-7">
          <div className="mb-7 text-center">
            <Settings className="mx-auto h-10 w-10 text-indigo-400" />
            <h2 className="mt-3 text-2xl font-black text-white">Set the design assumptions</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-400">These inputs are intentionally visible. Solar yield, inverter loading and battery autonomy should not depend on hidden “magic numbers.”</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ChoiceCard active={systemPreference === "hybrid"} onClick={() => setSystemPreference("hybrid")} icon={<BatteryCharging className="h-7 w-7" />} title="Hybrid / battery backup" body="Sizes battery storage for the backup duration you choose." />
            <ChoiceCard active={systemPreference === "on-grid"} onClick={() => setSystemPreference("on-grid")} icon={<Sun className="h-7 w-7" />} title="Grid-connected / no battery" body="Battery capacity is set to zero. Export rules depend on your utility and country." />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Peak sun hours / day"><input className="solar-input" type="number" min="1" max="8" step="0.1" value={peakSunHours} onChange={(e) => setPeakSunHours(Number(e.target.value))} /><Help>Use a representative annual-average solar resource for your location. If unknown, 5.0 is a planning assumption, not a location guarantee.</Help></Field>
            <Field label="PV system losses (%)"><input className="solar-input" type="number" min="0" max="60" step="0.5" value={systemLossPercent} onChange={(e) => setSystemLossPercent(Number(e.target.value))} /><Help>The default 14% mirrors the general PVWatts loss allowance for losses not otherwise modelled; inverter efficiency is handled separately here.</Help></Field>
            <Field label="Inverter efficiency (%)"><input className="solar-input" type="number" min="50" max="100" step="0.5" value={inverterEfficiencyPercent} onChange={(e) => setInverterEfficiencyPercent(Number(e.target.value))} /></Field>
            <Field label="Inverter headroom (%)"><input className="solar-input" type="number" min="0" max="100" step="1" value={inverterHeadroomPercent} onChange={(e) => setInverterHeadroomPercent(Number(e.target.value))} /></Field>
            <Field label="Target DC/AC ratio"><input className="solar-input" type="number" min="0.8" max="2" step="0.05" value={targetDcAcRatio} onChange={(e) => setTargetDcAcRatio(Number(e.target.value))} /></Field>
            <Field label="Overall load power factor"><input className="solar-input" type="number" min="0.5" max="1" step="0.01" value={overallPowerFactor} onChange={(e) => setOverallPowerFactor(Number(e.target.value))} /></Field>
            <Field label="Unknown motor start multiplier"><input className="solar-input" type="number" min="1" max="6" step="0.1" value={unknownMotorSurgeMultiplier} onChange={(e) => setUnknownMotorSurgeMultiplier(Number(e.target.value))} /></Field>
            <Field label="Simultaneous motor starts"><input className="solar-input" type="number" min="1" max="5" step="1" value={simultaneousMotorStarts} onChange={(e) => setSimultaneousMotorStarts(Number(e.target.value))} /></Field>
            <Field label="Electrical phase"><select className="solar-input" value={electricalPhase} onChange={(e) => setElectricalPhase(e.target.value as ElectricalPhase)}><option value="single">Single phase</option><option value="three">Three phase</option></select></Field>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/45 p-4 sm:p-5">
            <h3 className="font-black text-white">PV sizing goal</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <ChoiceCard active={coverageMode === "balanced"} onClick={() => setCoverageMode("balanced")} icon={<Gauge className="h-6 w-6" />} title="Balanced design" body="Sizes against both daily energy and the selected daytime running load." compact />
              <ChoiceCard active={coverageMode === "energy-offset"} onClick={() => setCoverageMode("energy-offset")} icon={<Zap className="h-6 w-6" />} title="Energy-offset design" body="Sizes the PV array from daily kWh only; grid/battery may support instantaneous peaks." compact />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/45 p-4 sm:p-5">
            <h3 className="font-black text-white">Solar panel</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Panel model"><select className="solar-input" value={String(selectedPanelId)} onChange={(e) => setSelectedPanelId(e.target.value === "custom" ? "custom" : Number(e.target.value))}>{initialPanels.map((panel) => <option key={panel.id} value={panel.id}>{panel.model_name} — {num(panel.wattage)}W</option>)}<option value="custom">Custom panel</option></select></Field>
              {selectedPanelId === "custom" && <Field label="Custom panel wattage"><input className="solar-input" type="number" min="50" max="1000" step="1" value={customPanelWattage} onChange={(e) => setCustomPanelWattage(Number(e.target.value))} /></Field>}
              {selectedPanelId === "custom" && <Field label="Panel length (m)"><input className="solar-input" type="number" min="0" step="0.01" value={customPanelLength} onChange={(e) => setCustomPanelLength(Number(e.target.value))} /></Field>}
              {selectedPanelId === "custom" && <Field label="Panel width (m)"><input className="solar-input" type="number" min="0" step="0.01" value={customPanelWidth} onChange={(e) => setCustomPanelWidth(Number(e.target.value))} /></Field>}
              <Field label="Roof spacing / access allowance (%)"><input className="solar-input" type="number" min="0" max="100" step="1" value={roofSpacingPercent} onChange={(e) => setRoofSpacingPercent(Number(e.target.value))} /></Field>
            </div>
          </div>

          {systemPreference === "hybrid" && (
            <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 sm:p-5">
              <h3 className="font-black text-white">Battery backup</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Backup duration (hours)"><input className="solar-input" type="number" min="0.5" max="48" step="0.5" value={backupHours} onChange={(e) => setBackupHours(Number(e.target.value))} /></Field>
                <Field label="Load backed up (%)"><input className="solar-input" type="number" min="1" max="100" step="1" value={backupLoadPercent} onChange={(e) => setBackupLoadPercent(Number(e.target.value))} /></Field>
                <Field label="Battery chemistry"><select className="solar-input" value={batteryChemistry} onChange={(e) => setBatteryChemistry(e.target.value as BatteryChemistry)}><option value="lifepo4">LiFePO₄ planning profile</option><option value="lead-acid">Lead-acid planning profile</option></select></Field>
                <Field label="Nominal battery voltage"><select className="solar-input" value={batteryVoltage} onChange={(e) => setBatteryVoltage(Number(e.target.value))}><option value={24}>24 V</option><option value={48}>48 V</option><option value={51.2}>51.2 V</option><option value={96}>96 V</option><option value={192}>192 V</option></select></Field>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => setActiveStep("builder")} className="min-h-12 rounded-xl border border-slate-700 px-5 text-sm font-black text-slate-300 hover:bg-slate-800"><ChevronLeft className="mr-1 inline h-4 w-4" /> Back to load</button>
            <button type="button" onClick={() => setActiveStep("recommendation")} className="min-h-12 rounded-xl bg-emerald-600 px-7 text-sm font-black text-white hover:bg-emerald-500">Calculate solar system <ArrowRight className="ml-2 inline h-4 w-4" /></button>
          </div>
        </section>
      )}

      {(activeBranch === "domestic" || commercialSubSector) && activeStep === "recommendation" && (
        <section className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-4 shadow-xl sm:p-6">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-400">Planning recommendation</p>
                <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                  {result.installedPvDcKw != null
                    ? `${round(result.installedPvDcKw, 2)} kWp installed PV`
                    : `${round(result.requiredPvDcKw, 2)} kWp required PV`}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Based on {round(result.dailyEnergyKwh, 1)} kWh/day, {round(result.peakRunningKw, 2)} kW running load and {peakSunHours} peak-sun-hours/day. This is an estimate with visible assumptions, not an installation certificate.</p>
              </div>
              <Link href="/methodology" className="min-h-11 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm font-black text-emerald-300 hover:bg-emerald-500/15">See formulas & methodology</Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard icon={<Sun className="h-5 w-5 text-sky-400" />} label="Solar panels" value={result.panelCount == null ? "N/A" : String(result.panelCount)} detail={selectedPanel?.name || "Select a valid panel"} />
            <ResultCard icon={<Cpu className="h-5 w-5 text-amber-400" />} label="Inverter continuous" value={`${round(result.inverterContinuousKw, 1)} kW`} detail={`${round(result.inverterApparentKva, 1)} kVA planning minimum • ${electricalPhase}-phase selected`} />
            <ResultCard icon={<Zap className="h-5 w-5 text-rose-400" />} label="Starting surge" value={`${round(result.recommendedSurgeRatingKw, 1)} kW`} detail={`Estimated start event: ${round(result.estimatedStartingSurgeKw, 1)} kW`} />
            <ResultCard icon={<BatteryCharging className="h-5 w-5 text-emerald-400" />} label="Battery bank" value={systemPreference === "hybrid" ? `${round(result.batteryNominalKwh, 1)} kWh` : "0 kWh"} detail={systemPreference === "hybrid" ? `≈ ${round(result.batteryApproxAh, 0)} Ah @ ${batteryVoltage}V nominal` : "Grid-connected design without battery storage"} />
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ResultCard icon={<Gauge className="h-5 w-5 text-violet-400" />} label="Running load" value={`${round(result.peakRunningKw, 2)} kW`} detail={`${round(result.peakApparentKva, 2)} kVA at PF ${overallPowerFactor}`} />
            <ResultCard icon={<Clock className="h-5 w-5 text-cyan-400" />} label="Daily energy" value={`${round(result.dailyEnergyKwh, 1)} kWh`} detail={`PV energy requirement: ${round(result.requiredPvDcKwEnergy, 2)} kWp`} />
            <ResultCard icon={<Maximize2 className="h-5 w-5 text-indigo-400" />} label="Roof area" value={result.roofAreaM2 == null ? "N/A" : `${round(result.roofAreaM2, 1)} m²`} detail={result.roofAreaFt2 == null ? "Panel dimensions required" : `≈ ${round(result.roofAreaFt2, 0)} ft² including ${roofSpacingPercent}% access allowance`} />
            <ResultCard icon={<Sun className="h-5 w-5 text-yellow-400" />} label="Estimated solar energy" value={result.estimatedDailySolarProductionKwh == null ? "N/A" : `${round(result.estimatedDailySolarProductionKwh, 1)} kWh/day`} detail={result.estimatedCoveragePercent == null ? "Panel selection required" : `${round(result.estimatedCoveragePercent, 0)}% of entered daily energy under the selected assumptions`} />
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
            <div className="bg-slate-950 px-4 py-3 font-black text-white">Calculation summary</div>
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <tbody className="divide-y divide-slate-800 bg-slate-900">
                  {[
                    ["Daily AC energy demand", `${round(result.dailyEnergyKwh, 2)} kWh/day`],
                    ["PV size from energy", `${round(result.requiredPvDcKwEnergy, 3)} kWp`],
                    ["PV size from running-load support", `${round(result.requiredPvDcKwPeak, 3)} kWp`],
                    ["Selected design PV requirement", `${round(result.requiredPvDcKw, 3)} kWp`],
                    ["Installed PV after whole-panel rounding", result.installedPvDcKw == null ? "N/A" : `${round(result.installedPvDcKw, 3)} kWp`],
                    ["Actual DC/AC ratio", result.actualDcAcRatio == null ? "N/A" : round(result.actualDcAcRatio, 2)],
                    ["Battery usable energy target", `${round(result.batteryUsableKwh, 2)} kWh`],
                    ["Combined PV-to-AC planning efficiency", `${round(result.assumptions.combinedEnergyEfficiency * 100, 1)}%`],
                  ].map(([label, value]) => (
                    <tr key={label}><th className="w-1/2 px-4 py-3 font-bold text-slate-400">{label}</th><td className="px-4 py-3 font-mono font-black text-slate-100">{value}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
            <div className="flex items-start gap-3"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" /><div><h3 className="font-black text-amber-100">Engineering checks before you buy equipment</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-amber-100/75">{result.warnings.map((warning, index) => <li key={index}>• {warning}</li>)}</ul></div></div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={() => setActiveStep("preferences")} className="min-h-12 rounded-xl border border-slate-700 px-5 text-sm font-black text-slate-300 hover:bg-slate-800"><ChevronLeft className="mr-1 inline h-4 w-4" /> Edit assumptions</button>
            <button type="button" onClick={resetAll} className="min-h-12 rounded-xl bg-slate-800 px-6 text-sm font-black text-white hover:bg-slate-700"><RotateCcw className="mr-2 inline h-4 w-4 text-sky-400" /> Start another calculation</button>
          </div>
        </section>
      )}

      <style jsx global>{`
        .solar-input {
          width: 100%;
          min-height: 44px;
          border: 1px solid rgb(51 65 85);
          border-radius: 0.75rem;
          background: rgb(2 6 23);
          padding: 0.65rem 0.75rem;
          color: rgb(241 245 249);
          outline: none;
        }
        .solar-input:focus { border-color: rgb(14 165 233); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="min-w-0"><span className="mb-1.5 block text-xs font-black text-slate-400">{label}</span>{children}</label>;
}

function Help({ children }: { children: React.ReactNode }) {
  return <span className="mt-1.5 flex items-start gap-1 text-[10px] leading-4 text-slate-500"><Info className="mt-0.5 h-3 w-3 shrink-0" />{children}</span>;
}

function ChoiceCard({ active, onClick, icon, title, body, compact = false }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; body: string; compact?: boolean }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`relative min-h-28 rounded-2xl border p-4 text-left transition ${active ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800/45 hover:border-slate-600"} ${compact ? "min-h-24" : ""}`}><div className={active ? "text-emerald-400" : "text-slate-400"}>{icon}</div><h3 className="mt-3 font-black text-white">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-400">{body}</p>{active && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-emerald-400" />}</button>;
}

function QuickMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2"><div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-1 text-sm font-black text-white">{value}</div></div>;
}

function ResultCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return <div className="min-w-0 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>{icon}</div><div className="mt-3 break-words text-2xl font-black text-white">{value}</div><p className="mt-2 break-words text-[11px] leading-5 text-slate-500">{detail}</p></div>;
}
