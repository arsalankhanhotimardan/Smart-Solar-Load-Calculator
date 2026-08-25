export interface CityInfo {
  slug: string;
  name: string;
  province: string;
  disco: string;
  avgPeakSunHours: number;
  description: string;
}

export const PAKISTAN_CITIES: Record<string, CityInfo> = {
  // === KHYBER PAKHTUNKHWA (PESCO / HAZECO / TESCO) ===
  peshawar: {
    slug: "peshawar", name: "Peshawar", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 5.3,
    description: "Design on-grid and hybrid solar installations tailored for residential and industrial loads under PESCO in Peshawar."
  },
  mardan: {
    slug: "mardan", name: "Mardan", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 5.2,
    description: "Calculate your home or commercial solar system load in Mardan with localized PESCO net-metering solar sizing."
  },
  swat: {
    slug: "swat", name: "Swat", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 4.9,
    description: "Solar load estimations and panel sizing for homes, hotels, and commercial buildings in Swat and Malakand division."
  },
  abbottabad: {
    slug: "abbottabad", name: "Abbottabad", province: "Khyber Pakhtunkhwa", disco: "HAZECO / PESCO", avgPeakSunHours: 4.8,
    description: "Accurate solar energy capacity sizing for domestic and commercial facilities in Abbottabad and Hazara region."
  },
  kohat: {
    slug: "kohat", name: "Kohat", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 5.4,
    description: "Calculate solar panel requirements and inverter sizes for homes and businesses in Kohat."
  },
  dera_ismail_khan: {
    slug: "dera-ismail-khan", name: "Dera Ismail Khan", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 5.6,
    description: "High-yield solar calculations for D.I. Khan's hot climate, optimizing panel capacity and battery backup."
  },
  nowshera: {
    slug: "nowshera", name: "Nowshera", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 5.3,
    description: "Calculate the exact solar system required for residential and industrial sectors in Nowshera."
  },
  charsadda: {
    slug: "charsadda", name: "Charsadda", province: "Khyber Pakhtunkhwa", disco: "PESCO", avgPeakSunHours: 5.2,
    description: "Smart solar load calculations for agriculture, homes, and commercial units in Charsadda."
  },

  // === FEDERAL CAPITAL & POTOHAR (IESCO) ===
  islamabad: {
    slug: "islamabad", name: "Islamabad", province: "Federal Capital", disco: "IESCO", avgPeakSunHours: 5.1,
    description: "Accurate solar energy capacity sizing for domestic houses, corporate plazas, and net-metering under IESCO in Islamabad."
  },
  rawalpindi: {
    slug: "rawalpindi", name: "Rawalpindi", province: "Punjab", disco: "IESCO", avgPeakSunHours: 5.1,
    description: "Calculate rooftop solar requirements and battery backup configurations for residential and commercial properties in Rawalpindi."
  },
  jhelum: {
    slug: "jhelum", name: "Jhelum", province: "Punjab", disco: "IESCO", avgPeakSunHours: 5.2,
    description: "Find your precise solar system size for homes and businesses in Jhelum to lower your IESCO bills."
  },
  attock: {
    slug: "attock", name: "Attock", province: "Punjab", disco: "IESCO", avgPeakSunHours: 5.3,
    description: "Solar load estimations for agricultural pumps, industries, and homes in Attock."
  },
  chakwal: {
    slug: "chakwal", name: "Chakwal", province: "Punjab", disco: "IESCO", avgPeakSunHours: 5.3,
    description: "Determine the exact solar capacity needed for reliable power in Chakwal."
  },

  // === PUNJAB CENTRAL (LESCO) ===
  lahore: {
    slug: "lahore", name: "Lahore", province: "Punjab", disco: "LESCO", avgPeakSunHours: 5.1,
    description: "High-precision solar load sizing for homes, factories, and commercial centers operating under LESCO in Lahore."
  },
  kasur: {
    slug: "kasur", name: "Kasur", province: "Punjab", disco: "LESCO", avgPeakSunHours: 5.2,
    description: "Design custom solar architectures for residential and industrial complexes in Kasur."
  },
  sheikhupura: {
    slug: "sheikhupura", name: "Sheikhupura", province: "Punjab", disco: "LESCO", avgPeakSunHours: 5.2,
    description: "Calculate industrial and home solar requirements to beat LESCO tariffs in Sheikhupura."
  },
  okara: {
    slug: "okara", name: "Okara", province: "Punjab", disco: "LESCO", avgPeakSunHours: 5.3,
    description: "Optimize solar generation for agricultural and residential needs in Okara."
  },

  // === PUNJAB INDUSTRIAL (FESCO) ===
  faisalabad: {
    slug: "faisalabad", name: "Faisalabad", province: "Punjab", disco: "FESCO", avgPeakSunHours: 5.3,
    description: "Tailored industrial and domestic solar load calculation for textile units, mills, and homes under FESCO in Faisalabad."
  },
  sargodha: {
    slug: "sargodha", name: "Sargodha", province: "Punjab", disco: "FESCO", avgPeakSunHours: 5.4,
    description: "Solar system sizing for commercial and residential consumers aiming for FESCO net-metering in Sargodha."
  },
  jhang: {
    slug: "jhang", name: "Jhang", province: "Punjab", disco: "FESCO", avgPeakSunHours: 5.4,
    description: "Calculate high-yield solar capacities for agriculture and residential power in Jhang."
  },
  mianwali: {
    slug: "mianwali", name: "Mianwali", province: "Punjab", disco: "FESCO", avgPeakSunHours: 5.5,
    description: "Design robust solar layouts for high sun hours in Mianwali."
  },

  // === PUNJAB NORTH (GEPCO) ===
  gujranwala: {
    slug: "gujranwala", name: "Gujranwala", province: "Punjab", disco: "GEPCO", avgPeakSunHours: 5.1,
    description: "Industrial and residential solar calculators mapped for heavy loads under GEPCO in Gujranwala."
  },
  sialkot: {
    slug: "sialkot", name: "Sialkot", province: "Punjab", disco: "GEPCO", avgPeakSunHours: 5.0,
    description: "Optimize solar power plants for Sialkot's export industries and residential complexes."
  },
  gujrat: {
    slug: "gujrat", name: "Gujrat", province: "Punjab", disco: "GEPCO", avgPeakSunHours: 5.1,
    description: "Calculate solar panel and inverter requirements for Gujrat's fan industries and households."
  },

  // === PUNJAB SOUTH (MEPCO) ===
  multan: {
    slug: "multan", name: "Multan", province: "Punjab", disco: "MEPCO", avgPeakSunHours: 5.6,
    description: "Optimize high-yield solar arrays and hybrid power systems for domestic and commercial consumers under MEPCO in Multan."
  },
  bahawalpur: {
    slug: "bahawalpur", name: "Bahawalpur", province: "Punjab", disco: "MEPCO", avgPeakSunHours: 5.7,
    description: "Harness Bahawalpur's high solar irradiance with precision system sizing for homes and businesses."
  },
  dera_ghazi_khan: {
    slug: "dera-ghazi-khan", name: "Dera Ghazi Khan", province: "Punjab", disco: "MEPCO", avgPeakSunHours: 5.6,
    description: "Calculate optimal solar loads for residential and agricultural installations in D.G. Khan."
  },
  rahim_yar_khan: {
    slug: "rahim-yar-khan", name: "Rahim Yar Khan", province: "Punjab", disco: "MEPCO", avgPeakSunHours: 5.7,
    description: "Generate highly accurate solar system blueprints for RYK consumers."
  },
  sahiwal: {
    slug: "sahiwal", name: "Sahiwal", province: "Punjab", disco: "MEPCO", avgPeakSunHours: 5.4,
    description: "Calculate solar solutions tailored to Sahiwal's specific climate and MEPCO guidelines."
  },

  // === SINDH (K-ELECTRIC / HESCO / SEPCO) ===
  karachi: {
    slug: "karachi", name: "Karachi", province: "Sindh", disco: "K-Electric", avgPeakSunHours: 5.4,
    description: "Calculate turnkey rooftop solar system capacity for homes, apartments, and industries connected to K-Electric in Karachi."
  },
  hyderabad: {
    slug: "hyderabad", name: "Hyderabad", province: "Sindh", disco: "HESCO", avgPeakSunHours: 5.5,
    description: "Determine the ideal solar capacity to beat load shedding and lower HESCO bills in Hyderabad."
  },
  sukkur: {
    slug: "sukkur", name: "Sukkur", province: "Sindh", disco: "SEPCO", avgPeakSunHours: 5.6,
    description: "High-performance solar load estimations for Sukkur's hot climate."
  },
  larkana: {
    slug: "larkana", name: "Larkana", province: "Sindh", disco: "SEPCO", avgPeakSunHours: 5.6,
    description: "Calculate the exact number of solar panels required for your home or business in Larkana."
  },
  nawabshah: {
    slug: "nawabshah", name: "Nawabshah", province: "Sindh", disco: "HESCO", avgPeakSunHours: 5.7,
    description: "Solar load profiling tailored for Nawabshah's extreme summer peak loads."
  },
  mirpurkhas: {
    slug: "mirpurkhas", name: "Mirpurkhas", province: "Sindh", disco: "HESCO", avgPeakSunHours: 5.5,
    description: "Find the best solar inverter and panel configuration for Mirpurkhas."
  },

  // === BALOCHISTAN (QESCO) ===
  quetta: {
    slug: "quetta", name: "Quetta", province: "Balochistan", disco: "QESCO", avgPeakSunHours: 5.8,
    description: "Calculate high-efficiency solar panel sizing and deep-cycle battery storage under QESCO in Quetta."
  },
  gwadar: {
    slug: "gwadar", name: "Gwadar", province: "Balochistan", disco: "QESCO", avgPeakSunHours: 5.6,
    description: "Design robust off-grid and hybrid solar installations for Gwadar's coastal climate."
  },
  khuzdar: {
    slug: "khuzdar", name: "Khuzdar", province: "Balochistan", disco: "QESCO", avgPeakSunHours: 5.7,
    description: "Solar energy calculations mapping exact power requirements for Khuzdar."
  },
  turbat: {
    slug: "turbat", name: "Turbat", province: "Balochistan", disco: "QESCO", avgPeakSunHours: 6.0,
    description: "Harness Turbat's massive solar potential with accurate system sizing."
  },

  // === AJK & GILGIT-BALTISTAN ===
  muzaffarabad: {
    slug: "muzaffarabad", name: "Muzaffarabad", province: "Azad Kashmir", disco: "AJKED", avgPeakSunHours: 4.7,
    description: "Solar load estimations optimizing winter sunlight limitations in Muzaffarabad."
  },
  mirpur: {
    slug: "mirpur", name: "Mirpur", province: "Azad Kashmir", disco: "AJKED", avgPeakSunHours: 5.1,
    description: "Design efficient solar panel and battery systems for homes in Mirpur AJK."
  },
  gilgit: {
    slug: "gilgit", name: "Gilgit", province: "Gilgit-Baltistan", disco: "GBPWD", avgPeakSunHours: 4.6,
    description: "Calculate specialized off-grid and hybrid solar setups for Gilgit's unique topography."
  },
  skardu: {
    slug: "skardu", name: "Skardu", province: "Gilgit-Baltistan", disco: "GBPWD", avgPeakSunHours: 4.6,
    description: "Find the perfect solar architecture to handle extreme winter loads in Skardu."
  }
};