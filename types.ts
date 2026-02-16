export type LanguageCode = 'en' | 'hi' | 'ta' | 'bn' | 'mr' | 'pa' | 'gu';

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: string;
  smokingHistory: boolean;
  notes: string;
  language: LanguageCode;
}

export interface Header {
  report_id: string;
  timestamp: string;
  version: string;
}

export interface SignalIntegrity {
  is_valid: boolean;
  snr_ratio: number;
  clipping_detected: boolean;
  background_noise_type: string;
  validation_note: string;
}

export interface VocalFeatures {
  fundamental_frequency: string;
  jitter_local: string;
  shimmer_local_db: string;
  harmonic_to_noise: string;
}

export interface NeurologicalMarkers {
  micro_tremor_freq: string;
  amplitude_stability: string;
  speech_rate: string;
}

export interface RespiratoryMarkers {
  cough_burst_intensity: string;
  sustained_vowel_duration: string;
  breath_pause_frequency: string;
}

export interface BiometricPayload {
  vocal_features: VocalFeatures;
  neurological_markers: NeurologicalMarkers;
  respiratory_markers: RespiratoryMarkers;
}

export interface ConfidenceMetrics {
  audio_confidence: number;
  symptom_alignment: number;
  aggregate_score: number;
}

export interface DifferentialDiagnosis {
  ruled_out: string[];
  exclusion_logic: string;
}

export interface ClinicalInference {
  primary_suspect: string;
  confidence_metrics: ConfidenceMetrics;
  differential_diagnosis: DifferentialDiagnosis;
}

export interface FrontendState {
  theme: string;
  urgency: string; // 'High' | 'Medium' | 'Low'
  ui_gauge_value: number;
  history_card_summary: string;
}

// --- Questionnaire Logic Types ---

export interface QuestionOption {
  label: string;
  next_question_id: string | null; // null indicates end of flow
}

export interface DiagnosticQuestion {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface DiagnosticFlow {
  initial_question_id: string;
  questions: DiagnosticQuestion[];
}

export interface QuestionResponse {
  question: string;
  answer: string;
}

export interface QuestionnaireData {
  responses: QuestionResponse[];
}

// The Master Schema
export interface VoiceScanData {
  header: Header;
  signal_integrity: SignalIntegrity;
  biometric_payload: BiometricPayload;
  clinical_inference: ClinicalInference;
  frontend_state: FrontendState;
  questionnaire_data?: QuestionnaireData;
}

export interface ScanResult {
  id: string;
  date: string;
  data: VoiceScanData; // The payload
}