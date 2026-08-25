"use client";

import React, { useState, useEffect } from "react";
import { getDomesticAppliances, getCommercialAppliances, getSolarPanelCatalog } from "../actions"; 
import { 
  Zap, Plus, Minus, Sun, Clock, RotateCcw, Cpu, BatteryCharging, ArrowRight, SlidersHorizontal, Maximize2, CheckCircle2, Factory, Settings, Home, Building2, GraduationCap, Stethoscope, Briefcase, ChevronLeft, Check, Mic
} from "lucide-react";
import AdBanner from "./AdBanner";

export default function SolarLoadBuilder() {
  const [activeBranch, setActiveBranch] = useState<"domestic" | "commercial">("domestic");
  const [commercialSubSector, setCommercialSubSector] = useState<"education" | "medical" | "industry" | "office" | null>(null);
  
  const [activeStep, setActiveStep] = useState<"builder" | "preferences" | "recommendation">("builder");
  
  const [domesticCatalog, setDomesticCatalog] = useState<any[]>([]);
  const [commercialCatalog, setCommercialCatalog] = useState<any[]>([]);
  const [panelCatalog, setPanelCatalog] = useState<any[]>([]);
  
  const [systemPreference, setSystemPreference] = useState<"on-grid" | "hybrid">("hybrid");
  const [selectedPanelId, setSelectedPanelId] = useState<number>(0);
  
  const [loadProfile, setLoadProfile] = useState<Record<number, { quantity: number, hoursPerDay: number }>>({});
  const [dropdownSelections, setDropdownSelections] = useState<Record<string, number>>({});

  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const domData = await getDomesticAppliances().catch(() => []);
      if (domData) setDomesticCatalog(domData);

      const comData = await getCommercialAppliances().catch(() => []);
      if (comData) setCommercialCatalog(comData);

      const panels = await getSolarPanelCatalog().catch(() => []);
      if (panels && panels.length > 0) {
        setPanelCatalog(panels);
        setSelectedPanelId(panels[0].id);
      }
    };
    loadData();
  }, []);

  const getVisibleCatalog = () => {
    if (activeBranch === "domestic") return domesticCatalog;
    if (activeBranch === "commercial" && commercialSubSector) {
      return commercialCatalog.filter(item => item.sub_sector === commercialSubSector);
    }
    return [];
  };

  const visibleCatalog = getVisibleCatalog();
  const categories = Array.from(new Set(visibleCatalog.map(item => item.category)));

  // --- VOICE ASSISTANT NLP ENGINE ---
  const processVoiceCommand = (transcript: string) => {
    const text = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const words = text.split(' ');
    
    const numberMap: Record<string, number> = {
      "ek": 1, "aik": 1, "one": 1, "1": 1,
      "do": 2, "two": 2, "2": 2, "tu": 2,
      "teen": 3, "three": 3, "3": 3,
      "char": 4, "chaar": 4, "four": 4, "4": 4,
      "panch": 5, "paanch": 5, "five": 5, "5": 5,
      "chey": 6, "che": 6, "six": 6, "6": 6,
      "saat": 7, "seven": 7, "7": 7,
      "aath": 8, "eight": 8, "8": 8,
      "nau": 9, "nine": 9, "9": 9,
      "das": 10, "ten": 10, "10": 10,
    };

    const applianceKeywords: Record<string, string> = {
      "ac": "ac", "esi": "ac", "conditioner": "ac",
      "fan": "fan", "fans": "fan", "pankha": "fan", "pankhe": "fan",
      "light": "light", "lights": "light", "bulb": "light", "bulbs": "light", "battian": "light",
      "fridge": "fridge", "refrigerator": "fridge",
      "pump": "pump", "motor": "pump", "pani": "pump",
      "iron": "iron", "istri": "iron",
      "tv": "tv", "television": "tv", "led": "tv",
      "oven": "kitchen", "microwave": "kitchen",
      "machine": "washer", "washer": "washer"
    };

    let updatedLoad = { ...loadProfile };
    let itemsAdded = 0;

    for (let i = 0; i < words.length - 1; i++) {
      if (numberMap[words[i]]) {
        const qty = numberMap[words[i]];
        const nextWord = words[i + 1];
        const categoryKey = applianceKeywords[nextWord];

        if (categoryKey) {
          const targetModel = visibleCatalog.find(m => m.category === categoryKey);
          if (targetModel) {
            const currentQty = updatedLoad[targetModel.id]?.quantity || 0;
            updatedLoad[targetModel.id] = {
              quantity: currentQty + qty,
              hoursPerDay: updatedLoad[targetModel.id]?.hoursPerDay || Number(targetModel.default_hours)
            };
            itemsAdded++;
          }
        }
      }
    }

    if (itemsAdded > 0) {
      setLoadProfile(updatedLoad);
      setVoiceFeedback(`Successfully added items from: "${transcript}"`);
    } else {
      setVoiceFeedback(`Couldn't detect appliances. Try saying "2 AC and 4 fans".`);
    }

    setTimeout(() => setVoiceFeedback(null), 4000);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Assistant. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-PK'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      processVoiceCommand(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Error", event.error);
      setVoiceFeedback("Microphone permission denied.");
      setTimeout(() => setVoiceFeedback(null), 3000);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const addApplianceToLoad = (itemId: number, defaultHours: number) => {
    if (!itemId) return;
    setLoadProfile(prev => {
      const current = prev[itemId] || { quantity: 0, hoursPerDay: defaultHours };
      return { ...prev, [itemId]: { ...current, quantity: current.quantity + 1 } };
    });
  };

  const updateLoadQuantity = (id: number, delta: number) => {
    setLoadProfile(prev => {
      const current = prev[id];
      if (!current) return prev;
      const newQty = Math.max(0, current.quantity + delta);
      if (newQty === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...current, quantity: newQty } };
    });
  };

  const updateLoadHours = (id: number, newHours: number) => {
    setLoadProfile(prev => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], hoursPerDay: Math.max(0.1, Math.min(24, newHours)) } };
    });
  };

  const resetAll = () => {
    setLoadProfile({});
    setActiveStep("builder");
  };

  const handleBranchSwitch = (branch: "domestic" | "commercial") => {
    setActiveBranch(branch);
    setActiveStep("builder");
    setLoadProfile({});
    setDropdownSelections({});
    if (branch === "commercial") setCommercialSubSector(null);
  };

  const getPeakRunningKw = () => {
    let watts = 0;
    Object.entries(loadProfile).forEach(([idStr, data]) => {
      const id = Number(idStr);
      const item = [...domesticCatalog, ...commercialCatalog].find(i => i.id === id);
      if (item) watts += (item.watts * data.quantity);
    });
    return watts / 1000;
  };

  const getTotalDailyUnits = () => {
    let wattHours = 0;
    Object.entries(loadProfile).forEach(([idStr, data]) => {
      const id = Number(idStr);
      const item = [...domesticCatalog, ...commercialCatalog].find(i => i.id === id);
      if (item) wattHours += (item.watts * data.quantity * data.hoursPerDay);
    });
    return wattHours / 1000;
  };

  const peakRunningKw = getPeakRunningKw();
  const totalDailyUnits = getTotalDailyUnits();

  const getSystemSize = (kwLoad: number, dailyUnits: number): number => {
    if (kwLoad === 0 && dailyUnits === 0) return 0;
    const sizeForEnergy = dailyUnits / 4.2; 
    const safetyBuffer = activeBranch === "commercial" ? 1.35 : 1.25; 
    const sizeForPeak = kwLoad * safetyBuffer;      
    const calculatedSize = Math.max(sizeForEnergy, sizeForPeak);
    
    const marketTiers = [0.5, 1, 2, 3, 5, 7.5, 10, 15, 20, 25, 30, 40, 50, 100, 150, 200, 300, 500]; 
    for (const tier of marketTiers) {
      if (calculatedSize <= tier) return tier;
    }
    return Math.ceil(calculatedSize);
  };

  const recommendedKw = getSystemSize(peakRunningKw, totalDailyUnits);

  const currentPanelModel = panelCatalog.find(p => p.id === selectedPanelId) || panelCatalog[0] || { wattage: 550, length_meters: 2.27, width_meters: 1.13, model_name: 'Standard 550W' };
  const exactPanelCount = recommendedKw > 0 ? Math.ceil((recommendedKw * 1000) / currentPanelModel.wattage) : 0;
  const totalAreaSqMeters = Math.round((Number(currentPanelModel.length_meters) * Number(currentPanelModel.width_meters)) * exactPanelCount * 1.2 * 10) / 10;
  const totalAreaSqFeet = Math.round(totalAreaSqMeters * 10.764);
  const inverterCapacityKw = Math.max(activeBranch === "commercial" ? 10 : 3, recommendedKw); 
  const batteryBankKWh = systemPreference === "hybrid" ? Math.max(activeBranch === "commercial" ? 10 : 2.4, Math.round(recommendedKw * 2 * 10) / 10) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 font-sans relative">
      
      {voiceFeedback && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-sky-500 text-white px-6 py-3 rounded-xl shadow-2xl animate-fadeIn text-sm font-bold flex items-center gap-3">
          <Mic className="w-5 h-5 text-sky-400" />
          {voiceFeedback}
        </div>
      )}

      {/* AD CONTAINER 1: Right below header / top leaderboard */}
      <AdBanner dataAdSlot="1111111111" dataAdFormat="horizontal" />

      {/* JARGON-FREE BRANCH TOGGLE */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex items-center justify-between shadow-lg">
        <button onClick={() => handleBranchSwitch("domestic")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeBranch === "domestic" ? "bg-sky-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
          <Home className="w-5 h-5" /> Home Solar
        </button>
        <button onClick={() => handleBranchSwitch("commercial")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${activeBranch === "commercial" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white hover:bg-slate-800"}`}>
          <Building2 className="w-5 h-5" /> Commercial Solar
        </button>
      </div>

      {/* USER-FRIENDLY PROGRESS INDICATOR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${activeBranch === "domestic" ? "bg-sky-500/15 border-sky-500/30 text-sky-400" : "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{activeBranch === "domestic" ? "Home Solar Calculator" : "Commercial Solar Calculator"}</h3>
            <p className="text-xs text-slate-400">
              {activeStep === "builder" && "Step 1: Enter Your Power Load"}
              {activeStep === "preferences" && "Step 2: Choose System Type"}
              {activeStep === "recommendation" && "Step 3: Final System Design"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setActiveStep("builder")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeStep === "builder" ? (activeBranch === "domestic" ? "bg-sky-600 text-white" : "bg-indigo-600 text-white") : "bg-slate-800 text-slate-400 hover:text-white"}`}>1. Load</button>
          <button onClick={() => { if (recommendedKw > 0) setActiveStep("preferences"); }} disabled={recommendedKw === 0} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeStep === "preferences" ? (activeBranch === "domestic" ? "bg-sky-600 text-white" : "bg-indigo-600 text-white") : recommendedKw > 0 ? "bg-slate-800 text-sky-400 hover:bg-slate-700" : "bg-slate-800/40 text-slate-600 cursor-not-allowed"}`}>2. System</button>
          <button onClick={() => { if (recommendedKw > 0 && activeStep !== "builder") setActiveStep("recommendation"); }} disabled={recommendedKw === 0 || activeStep === "builder"} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeStep === "recommendation" ? "bg-emerald-600 text-white" : recommendedKw > 0 && activeStep !== "builder" ? "bg-slate-800 text-emerald-400 hover:bg-slate-700" : "bg-slate-800/40 text-slate-600 cursor-not-allowed"}`}>3. Design</button>
        </div>
      </div>

      {activeBranch === "commercial" && !commercialSubSector && (
        <section className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 shadow-xl animate-fadeIn">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white">Select Your Commercial Sector</h2>
            <p className="text-slate-400 mt-2">Choose your facility type to load the correct electrical equipment.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <button onClick={() => { setCommercialSubSector("education"); setLoadProfile({}); }} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <GraduationCap className="w-12 h-12 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-1">School / College / University</h3>
              <p className="text-xs text-slate-400">Classrooms, IT Labs, and Campus Facilities</p>
            </button>
            <button onClick={() => { setCommercialSubSector("medical"); setLoadProfile({}); }} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-rose-500 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <Stethoscope className="w-12 h-12 text-rose-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-1">Hospital / Clinic / Labs</h3>
              <p className="text-xs text-slate-400">Medical Imaging, ICU, and Clinical Machinery</p>
            </button>
            <button onClick={() => { setCommercialSubSector("industry"); setLoadProfile({}); }} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <Factory className="w-12 h-12 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-1">Industry / Manufacturing</h3>
              <p className="text-xs text-slate-400">3-Phase Motors, Chillers, and Heavy Machinery</p>
            </button>
            <button onClick={() => { setCommercialSubSector("office"); setLoadProfile({}); }} className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-sky-500 p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all group">
              <Briefcase className="w-12 h-12 text-sky-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-1">Offices / Plazas / Retail</h3>
              <p className="text-xs text-slate-400">Server Racks, Elevators, and Central HVAC</p>
            </button>
          </div>
        </section>
      )}

      {((activeBranch === "domestic") || (activeBranch === "commercial" && commercialSubSector)) && activeStep === "builder" && (
        <section className={`bg-slate-900 border rounded-2xl p-6 shadow-xl animate-fadeIn ${activeBranch === "domestic" ? "border-sky-500/30" : "border-indigo-500/30"}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-slate-800 gap-4">
            <div className="flex items-center gap-3">
              {activeBranch === "commercial" && (
                <button onClick={() => { setCommercialSubSector(null); setLoadProfile({}); }} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition" title="Change Sector">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{activeBranch === "domestic" ? "Enter Your Home Load" : "Enter Facility Load"}</h2>
                <p className="text-xs text-slate-400 mt-1">Select an item from the dropdown and click <strong>Add</strong>, or use Voice Assist.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={startListening}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all ${isListening ? "bg-rose-500 animate-pulse scale-105" : "bg-sky-600 hover:bg-sky-500"}`}
              >
                <Mic className="w-4 h-4" /><span>{isListening ? "Listening..." : "Voice Assist"}</span>
              </button>
              <button onClick={resetAll} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition" title="Clear All"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {categories.map((category) => {
              const categoryModels = visibleCatalog.filter(item => item.category === category);
              if (categoryModels.length === 0) return null;
              
              const title = categoryModels[0].category_title;
              const icon = categoryModels[0].icon;
              const selectedDropdownId = dropdownSelections[category] || categoryModels[0].id;
              const activeCategoryItems = categoryModels.filter(m => loadProfile[m.id]?.quantity > 0);

              return (
                <div key={category} className={`rounded-2xl border transition-all overflow-hidden flex flex-col ${activeCategoryItems.length > 0 ? (activeBranch === "domestic" ? "bg-slate-800/60 border-sky-500/50" : "bg-slate-800/60 border-indigo-500/50") : "bg-slate-950/40 border-slate-800"}`}>
                  <div className="p-4 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl p-2 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">{icon}</span>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <select 
                        value={selectedDropdownId} 
                        onChange={(e) => setDropdownSelections(prev => ({ ...prev, [category]: Number(e.target.value) }))}
                        className={`flex-1 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none ${activeBranch === "domestic" ? "focus:border-sky-500" : "focus:border-indigo-500"}`}
                      >
                        {categoryModels.map((m) => (
                          <option key={m.id} value={m.id}>{m.model_name} ({m.watts}W)</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const targetModel = categoryModels.find(m => m.id === selectedDropdownId);
                          if (targetModel) addApplianceToLoad(targetModel.id, Number(targetModel.default_hours));
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition flex items-center gap-1 ${activeBranch === "domestic" ? "bg-sky-600 hover:bg-sky-500" : "bg-indigo-600 hover:bg-indigo-500"}`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {activeCategoryItems.length > 0 && (
                    <div className="p-4 space-y-3 bg-slate-800/30 border-t border-slate-700/50">
                      {activeCategoryItems.map(item => {
                        const qty = loadProfile[item.id].quantity;
                        const hrs = loadProfile[item.id].hoursPerDay;
                        return (
                          <div key={item.id} className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex flex-col gap-3 animate-fadeIn">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-[11px] font-bold text-white leading-tight">{item.model_name}</h5>
                                <p className="text-[10px] text-slate-400 mt-0.5">{item.urdu_name} • <strong className={activeBranch === "domestic" ? "text-sky-400" : "text-indigo-400"}>{item.watts}W</strong></p>
                              </div>
                              <div className="flex items-center gap-1.5 bg-slate-950 px-1.5 py-1 rounded-lg border border-slate-800 shrink-0">
                                <button onClick={() => updateLoadQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition"><Minus className="w-3 h-3" /></button>
                                <span className={`w-5 text-center font-bold text-xs ${activeBranch === "domestic" ? "text-sky-400" : "text-indigo-400"}`}>{qty}</span>
                                <button onClick={() => updateLoadQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition"><Plus className="w-3 h-3" /></button>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <input 
                                type="range" min="0.5" max="24" step="0.5" 
                                value={hrs} onChange={(e) => updateLoadHours(item.id, parseFloat(e.target.value))} 
                                className="flex-1 accent-amber-400 h-1 bg-slate-800 rounded"
                              />
                              <span className="text-[10px] text-amber-400 font-bold w-12 text-right">{hrs} hrs</span>
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

          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-400 flex flex-wrap gap-4 w-full sm:w-auto justify-center">
              <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">Peak Load: <strong className="text-white text-sm">{peakRunningKw > 0 ? (peakRunningKw * 1000).toLocaleString() : 0} W</strong></span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">Daily Demand: <strong className="text-white text-sm">{totalDailyUnits.toFixed(1)} kWh</strong></span>
            </div>
            <button onClick={() => setActiveStep("preferences")} disabled={recommendedKw === 0} className={`w-full sm:w-auto ${activeBranch === "domestic" ? "bg-sky-600 hover:bg-sky-500" : "bg-indigo-600 hover:bg-indigo-500"} disabled:bg-slate-800 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm`}>Next Step <ArrowRight className="w-4 h-4" /></button>
          </div>
        </section>
      )}

      {((activeBranch === "domestic") || (activeBranch === "commercial" && commercialSubSector)) && activeStep === "preferences" && (
        <section className={`bg-slate-900 border rounded-2xl p-8 shadow-xl animate-fadeIn max-w-3xl mx-auto ${activeBranch === "domestic" ? "border-sky-500/30" : "border-indigo-500/30"}`}>
          <div className="text-center mb-8">
            <Settings className={`w-10 h-10 mx-auto mb-3 ${activeBranch === "domestic" ? "text-sky-400" : "text-indigo-400"}`} />
            <h2 className="text-2xl font-bold text-white">Choose Your System Type</h2>
            <p className="text-sm text-slate-400 mt-2">Do you need battery backup for load shedding?</p>
          </div>

          <div className="space-y-8">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div onClick={() => setSystemPreference("hybrid")} className={`cursor-pointer border-2 rounded-xl p-5 transition-all ${systemPreference === "hybrid" ? "border-emerald-500 bg-emerald-500/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}`}>
                  <BatteryCharging className={`w-8 h-8 mb-3 ${systemPreference === "hybrid" ? "text-emerald-400" : "text-slate-400"}`} />
                  <h4 className="font-bold text-white mb-1">Hybrid (With Batteries)</h4>
                  <p className="text-xs text-slate-400">Protects against load shedding and provides night-time power.</p>
                  {systemPreference === "hybrid" && <Check className="w-5 h-5 text-emerald-500 mt-3 absolute top-3 right-3"/>}
                </div>
                <div onClick={() => setSystemPreference("on-grid")} className={`cursor-pointer border-2 rounded-xl p-5 transition-all ${systemPreference === "on-grid" ? (activeBranch === "domestic" ? "border-sky-500 bg-sky-500/10" : "border-indigo-500 bg-indigo-500/10") : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}`}>
                  <Sun className={`w-8 h-8 mb-3 ${systemPreference === "on-grid" ? (activeBranch === "domestic" ? "text-sky-400" : "text-indigo-400") : "text-slate-400"}`} />
                  <h4 className="font-bold text-white mb-1">On-Grid (No Batteries)</h4>
                  <p className="text-xs text-slate-400">Uses net-metering to export excess power to the grid.</p>
                  {systemPreference === "on-grid" && <Check className={`w-5 h-5 mt-3 absolute top-3 right-3 ${activeBranch === "domestic" ? "text-sky-500" : "text-indigo-500"}`}/>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white mb-4">Select Solar Panel Size</h3>
              <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-inner">
                <select value={selectedPanelId} onChange={(e) => setSelectedPanelId(Number(e.target.value))} className={`w-full bg-slate-950 border border-slate-600 text-white text-sm rounded-xl px-4 py-3 focus:outline-none ${activeBranch === "domestic" ? "focus:border-sky-500" : "focus:border-indigo-500"}`}>
                  {panelCatalog.map((p) => (<option key={p.id} value={p.id}>{p.model_name} - {p.wattage} Watts</option>))}
                </select>
                <p className="text-xs text-slate-400 mt-3 flex items-center gap-2"><Factory className="w-4 h-4"/> Higher wattage panels save roof space.</p>
              </div>
            </div>

            <button onClick={() => setActiveStep("recommendation")} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all text-lg flex items-center justify-center gap-2">
              Calculate My Solar System <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: EXPERT SYSTEM RECOMMENDATION WIZARD */}
      {((activeBranch === "domestic") || (activeBranch === "commercial" && commercialSubSector)) && activeStep === "recommendation" && (
        <section className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn">
          
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-xl flex flex-col md:flex-row items-center gap-5 text-center md:text-left shadow-inner">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${activeBranch === "domestic" ? "bg-sky-500/15 border-sky-500/30 text-sky-400" : "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"}`}>
              {activeBranch === "domestic" ? <Home className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Required System Size</span>
              <h3 className="text-3xl font-black text-white mt-1">{recommendedKw} kW <span className={`text-base font-normal ${activeBranch === "domestic" ? "text-sky-400" : "text-indigo-400"}`}>Solar System</span></h3>
              <p className="text-sm text-slate-400 mt-1">Calculated to support your peak load of <strong className="text-slate-200">{(peakRunningKw * 1000).toLocaleString()}W</strong> and <strong className="text-slate-200">{totalDailyUnits.toFixed(1)} kWh</strong> daily demand.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition">
              <div>
                <div className="flex justify-between mb-3"><span className="text-xs font-bold text-sky-400">1. Solar Panels</span><Sun className="w-5 h-5 text-sky-400" /></div>
                <div className="text-3xl font-extrabold text-white mb-1">{exactPanelCount} <span className="text-sm font-normal text-slate-400">Units</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{currentPanelModel.model_name}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Includes mounting frame</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition">
              <div>
                <div className="flex justify-between mb-3"><span className="text-xs font-bold text-indigo-400">2. Roof Area</span><Maximize2 className="w-5 h-5 text-indigo-400" /></div>
                <div className="text-3xl font-extrabold text-white mb-1">{totalAreaSqFeet} <span className="text-sm font-normal text-slate-400">sq.ft</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">Approx. {totalAreaSqMeters} sq. meters required.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Needs unshaded space</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition">
              <div>
                <div className="flex justify-between mb-3"><span className="text-xs font-bold text-amber-400">3. Inverter</span><Cpu className="w-5 h-5 text-amber-400" /></div>
                <div className="text-3xl font-extrabold text-white mb-1">{inverterCapacityKw} <span className="text-sm font-normal text-slate-400">kW</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{systemPreference === "hybrid" ? (activeBranch === "commercial" ? "3-Phase Hybrid MPPT" : "Hybrid MPPT Inverter") : (activeBranch === "commercial" ? "3-Phase On-Grid" : "On-Grid String Inverter")}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> Wi-Fi app enabled</div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-emerald-500/30 transition">
              <div>
                <div className="flex justify-between mb-3"><span className="text-xs font-bold text-emerald-400">4. Battery Bank</span><BatteryCharging className="w-5 h-5 text-emerald-400" /></div>
                <div className="text-3xl font-extrabold text-white mb-1">{systemPreference === "hybrid" ? `${batteryBankKWh}` : "0"} <span className="text-sm font-normal text-slate-400">{systemPreference === "hybrid" ? 'kWh' : ''}</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{systemPreference === "hybrid" ? (activeBranch === "commercial" ? "High-voltage commercial storage." : "Deep-cycle backup bank.") : "No batteries needed."}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {systemPreference === "hybrid" ? "Protects from load shedding" : "Direct grid export"}</div>
            </div>
          </div>

          {/* AD CONTAINER 2: Inside Final Recommendation view (High intent monetization) */}
          <AdBanner dataAdSlot="2222222222" dataAdFormat="auto" />
          
          <div className="flex justify-center mt-6">
              <button onClick={() => setActiveStep("preferences")} className="text-slate-400 hover:text-white text-xs underline transition">Back to System Settings</button>
          </div>
        </section>
      )}
    </div>
  );
}