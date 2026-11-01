
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "appointments": {
                  Row: {
                    "created_at": string,"decided_at": string | null,"doctor_id": string,"duration_min": number,"id": string,"notes": string | null,"patient_id": string,"starts_at": string,"status": Database["public"]['Enums']["appt_status"],"type": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"decided_at"?: string | null,"doctor_id": string,"duration_min"?: number,"id"?: string,"notes"?: string | null,"patient_id": string,"starts_at": string,"status"?: Database["public"]['Enums']["appt_status"],"type"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"decided_at"?: string | null,"doctor_id"?: string,"duration_min"?: number,"id"?: string,"notes"?: string | null,"patient_id"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["appt_status"],"type"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "appointments_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "appointments_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "appointments_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity": string,"entity_id": string | null,"hash": string | null,"id": number,"meta": Json | null,"prev_hash": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"hash"?: string | null,"id"?: number,"meta"?: Json | null,"prev_hash"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"hash"?: string | null,"id"?: number,"meta"?: Json | null,"prev_hash"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"chat_messages": {
                  Row: {
                    "content": string,"created_at": string,"id": string,"mode": string | null,"role": string,"session_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"created_at"?: string,"id"?: string,"mode"?: string | null,"role": string,"session_id": string
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"id"?: string,"mode"?: string | null,"role"?: string,"session_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "chat_messages_session_id_fkey"
      columns: ["session_id"]
isOneToOne: false
      referencedRelation: "chat_sessions"
      referencedColumns: ["id"]
    }
                  ]
                },"chat_sessions": {
                  Row: {
                    "created_at": string,"id": string,"is_temp": boolean,"title": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_temp"?: boolean,"title": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_temp"?: boolean,"title"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "chat_sessions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "chat_sessions_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"consultation_diagnoses": {
                  Row: {
                    "confirmed_by_doctor": boolean,"consultation_id": string,"created_at": string,"disease_id": number,"id": string,"note": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "confirmed_by_doctor"?: boolean,"consultation_id": string,"created_at"?: string,"disease_id": number,"id"?: string,"note"?: string | null
                  }
                  Update: {
                    "confirmed_by_doctor"?: boolean,"consultation_id"?: string,"created_at"?: string,"disease_id"?: number,"id"?: string,"note"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "consultation_diagnoses_consultation_id_fkey"
      columns: ["consultation_id"]
isOneToOne: false
      referencedRelation: "consultations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consultation_diagnoses_disease_id_fkey"
      columns: ["disease_id"]
isOneToOne: false
      referencedRelation: "disease_mappings"
      referencedColumns: ["id"]
    }
                  ]
                },"consultations": {
                  Row: {
                    "appointment_id": string | null,"chief_complaint": string | null,"created_at": string,"doctor_id": string,"duration_seconds": number | null,"history": string | null,"id": string,"patient_id": string,"published_at": string | null,"started_at": string,"status": Database["public"]['Enums']["consult_status"],"updated_at": string,"vitals": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "appointment_id"?: string | null,"chief_complaint"?: string | null,"created_at"?: string,"doctor_id": string,"duration_seconds"?: number | null,"history"?: string | null,"id"?: string,"patient_id": string,"published_at"?: string | null,"started_at"?: string,"status"?: Database["public"]['Enums']["consult_status"],"updated_at"?: string,"vitals"?: Json | null
                  }
                  Update: {
                    "appointment_id"?: string | null,"chief_complaint"?: string | null,"created_at"?: string,"doctor_id"?: string,"duration_seconds"?: number | null,"history"?: string | null,"id"?: string,"patient_id"?: string,"published_at"?: string | null,"started_at"?: string,"status"?: Database["public"]['Enums']["consult_status"],"updated_at"?: string,"vitals"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "consultations_appointment_id_fkey"
      columns: ["appointment_id"]
isOneToOne: false
      referencedRelation: "appointments"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consultations_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consultations_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "consultations_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "consultations_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"disease_mappings": {
                  Row: {
                    "ayurveda_code": string | null,"ayurveda_def": string | null,"ayurveda_sim": number | null,"ayurveda_term": string | null,"created_at": string,"icd11_code": string | null,"icd11_title": string,"id": number,"search": unknown,"siddha_code": string | null,"siddha_def": string | null,"siddha_sim": number | null,"siddha_term": string | null,"unani_code": string | null,"unani_def": string | null,"unani_sim": number | null,"unani_term": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "ayurveda_code"?: string | null,"ayurveda_def"?: string | null,"ayurveda_sim"?: number | null,"ayurveda_term"?: string | null,"created_at"?: string,"icd11_code"?: string | null,"icd11_title": string,"id"?: number,"search"?: never,"siddha_code"?: string | null,"siddha_def"?: string | null,"siddha_sim"?: number | null,"siddha_term"?: string | null,"unani_code"?: string | null,"unani_def"?: string | null,"unani_sim"?: number | null,"unani_term"?: string | null
                  }
                  Update: {
                    "ayurveda_code"?: string | null,"ayurveda_def"?: string | null,"ayurveda_sim"?: number | null,"ayurveda_term"?: string | null,"created_at"?: string,"icd11_code"?: string | null,"icd11_title"?: string,"id"?: number,"search"?: never,"siddha_code"?: string | null,"siddha_def"?: string | null,"siddha_sim"?: number | null,"siddha_term"?: string | null,"unani_code"?: string | null,"unani_def"?: string | null,"unani_sim"?: number | null,"unani_term"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"doctor_details": {
                  Row: {
                    "address": string | null,"clinic_name": string | null,"created_at": string,"experience_years": number | null,"lat": number | null,"lng": number | null,"rating": number | null,"signature_path": string | null,"slot_minutes": number | null,"specializations": (string)[] | null,"updated_at": string,"user_id": string,"verified": boolean | null,"working_hours": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"clinic_name"?: string | null,"created_at"?: string,"experience_years"?: number | null,"lat"?: number | null,"lng"?: number | null,"rating"?: number | null,"signature_path"?: string | null,"slot_minutes"?: number | null,"specializations"?: (string)[] | null,"updated_at"?: string,"user_id": string,"verified"?: boolean | null,"working_hours"?: Json | null
                  }
                  Update: {
                    "address"?: string | null,"clinic_name"?: string | null,"created_at"?: string,"experience_years"?: number | null,"lat"?: number | null,"lng"?: number | null,"rating"?: number | null,"signature_path"?: string | null,"slot_minutes"?: number | null,"specializations"?: (string)[] | null,"updated_at"?: string,"user_id"?: string,"verified"?: boolean | null,"working_hours"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "doctor_details_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "doctor_details_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"doctor_patient_links": {
                  Row: {
                    "created_at": string,"doctor_id": string,"id": string,"linked_at": string,"patient_id": string,"revoked_at": string | null,"status": Database["public"]['Enums']["link_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"doctor_id": string,"id"?: string,"linked_at"?: string,"patient_id": string,"revoked_at"?: string | null,"status"?: Database["public"]['Enums']["link_status"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"doctor_id"?: string,"id"?: string,"linked_at"?: string,"patient_id"?: string,"revoked_at"?: string | null,"status"?: Database["public"]['Enums']["link_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "doctor_patient_links_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "doctor_patient_links_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "doctor_patient_links_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "doctor_patient_links_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"document_shares": {
                  Row: {
                    "created_at": string,"doctor_id": string,"document_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"doctor_id": string,"document_id": string
                  }
                  Update: {
                    "created_at"?: string,"doctor_id"?: string,"document_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "document_shares_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "document_shares_doctor_id_fkey"
      columns: ["doctor_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    },{
      foreignKeyName: "document_shares_document_id_fkey"
      columns: ["document_id"]
isOneToOne: false
      referencedRelation: "documents"
      referencedColumns: ["id"]
    }
                  ]
                },"documents": {
                  Row: {
                    "created_at": string,"doc_type": string,"id": string,"mime": string,"name": string,"patient_id": string,"size_bytes": number,"storage_path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"doc_type": string,"id"?: string,"mime": string,"name": string,"patient_id": string,"size_bytes": number,"storage_path": string
                  }
                  Update: {
                    "created_at"?: string,"doc_type"?: string,"id"?: string,"mime"?: string,"name"?: string,"patient_id"?: string,"size_bytes"?: number,"storage_path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "documents_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "documents_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"fhir_bundles": {
                  Row: {
                    "bundle": NonNullable<Json>,"consultation_id": string,"created_at": string,"id": string,"published": boolean,"validation": Json | null,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "bundle": NonNullable<Json>,"consultation_id": string,"created_at"?: string,"id"?: string,"published"?: boolean,"validation"?: Json | null,"version"?: number
                  }
                  Update: {
                    "bundle"?: NonNullable<Json>,"consultation_id"?: string,"created_at"?: string,"id"?: string,"published"?: boolean,"validation"?: Json | null,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "fhir_bundles_consultation_id_fkey"
      columns: ["consultation_id"]
isOneToOne: true
      referencedRelation: "consultations"
      referencedColumns: ["id"]
    }
                  ]
                },"medications": {
                  Row: {
                    "consultation_id": string,"created_at": string,"dosage": string,"drug": string,"duration_days": number,"frequency": string,"id": string,"instructions": string | null,"sort": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "consultation_id": string,"created_at"?: string,"dosage": string,"drug": string,"duration_days"?: number,"frequency": string,"id"?: string,"instructions"?: string | null,"sort"?: number | null
                  }
                  Update: {
                    "consultation_id"?: string,"created_at"?: string,"dosage"?: string,"drug"?: string,"duration_days"?: number,"frequency"?: string,"id"?: string,"instructions"?: string | null,"sort"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "medications_consultation_id_fkey"
      columns: ["consultation_id"]
isOneToOne: false
      referencedRelation: "consultations"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "body": string,"created_at": string,"id": string,"kind": string,"link": string | null,"read": boolean,"title": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"created_at"?: string,"id"?: string,"kind": string,"link"?: string | null,"read"?: boolean,"title": string,"user_id": string
                  }
                  Update: {
                    "body"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"link"?: string | null,"read"?: boolean,"title"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"otp_challenges": {
                  Row: {
                    "attempts": number,"consumed": boolean,"created_at": string,"expires_at": string,"id": string,"meta": Json | null,"otp_hash": string,"profile_id": string | null,"purpose": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"consumed"?: boolean,"created_at"?: string,"expires_at": string,"id"?: string,"meta"?: Json | null,"otp_hash": string,"profile_id"?: string | null,"purpose": string
                  }
                  Update: {
                    "attempts"?: number,"consumed"?: boolean,"created_at"?: string,"expires_at"?: string,"id"?: string,"meta"?: Json | null,"otp_hash"?: string,"profile_id"?: string | null,"purpose"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "otp_challenges_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "otp_challenges_profile_id_fkey"
      columns: ["profile_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"patient_identifiers": {
                  Row: {
                    "created_at": string,"id": string,"patient_id": string,"type": Database["public"]['Enums']["identifier_type"],"value": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"patient_id": string,"type": Database["public"]['Enums']["identifier_type"],"value": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"patient_id"?: string,"type"?: Database["public"]['Enums']["identifier_type"],"value"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "patient_identifiers_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "patient_identifiers_patient_id_fkey"
      columns: ["patient_id"]
isOneToOne: false
      referencedRelation: "public_doctors"
      referencedColumns: ["user_id"]
    }
                  ]
                },"prescription_translations": {
                  Row: {
                    "created_at": string,"drug_text": string,"instructions_text": string,"lang": string,"medication_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"drug_text": string,"instructions_text": string,"lang": string,"medication_id": string
                  }
                  Update: {
                    "created_at"?: string,"drug_text"?: string,"instructions_text"?: string,"lang"?: string,"medication_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "prescription_translations_medication_id_fkey"
      columns: ["medication_id"]
isOneToOne: false
      referencedRelation: "medications"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "abha_address": string | null,"abha_number": string | null,"avatar_path": string | null,"blood_group": string | null,"claimed": boolean | null,"council_reg_no": string | null,"created_at": string,"dob": string | null,"email": string | null,"full_name": string,"gender": string | null,"hpr_id": string | null,"id": string,"mobile": string | null,"preferred_language": string | null,"role": Database["public"]['Enums']["app_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "abha_address"?: string | null,"abha_number"?: string | null,"avatar_path"?: string | null,"blood_group"?: string | null,"claimed"?: boolean | null,"council_reg_no"?: string | null,"created_at"?: string,"dob"?: string | null,"email"?: string | null,"full_name": string,"gender"?: string | null,"hpr_id"?: string | null,"id": string,"mobile"?: string | null,"preferred_language"?: string | null,"role": Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Update: {
                    "abha_address"?: string | null,"abha_number"?: string | null,"avatar_path"?: string | null,"blood_group"?: string | null,"claimed"?: boolean | null,"council_reg_no"?: string | null,"created_at"?: string,"dob"?: string | null,"email"?: string | null,"full_name"?: string,"gender"?: string | null,"hpr_id"?: string | null,"id"?: string,"mobile"?: string | null,"preferred_language"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "public_doctors": {
                  Row: {
                    "address": string | null,"clinic_name": string | null,"full_name": string,"lat": number | null,"lng": number | null,"rating": number | null,"specializations": (string)[] | null,"user_id": string,"verified": boolean | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "doctor_dashboard_stats":
{ Args: { "d": string }; Returns: Json
                           },
"is_linked":
{ Args: { "d": string,"p": string }; Returns: boolean
                           },
"nearby_doctors":
{ Args: { "radius_km": number,"spec"?: string,"user_lat": number,"user_lng": number }; Returns: {
              "address": string,"clinic_name": string,"distance_km": number,"full_name": string,"lat": number,"lng": number,"next_slot": string,"rating": number,"specializations": (string)[],"user_id": string
            }[]
                           },
"search_diseases":
{ Args: { "lim"?: number,"q": string }; Returns: {
              "ayurveda_code": string | null,
"ayurveda_def": string | null,
"ayurveda_sim": number | null,
"ayurveda_term": string | null,
"created_at": string,
"icd11_code": string | null,
"icd11_title": string,
"id": number,
"search": unknown,
"siddha_code": string | null,
"siddha_def": string | null,
"siddha_sim": number | null,
"siddha_term": string | null,
"unani_code": string | null,
"unani_def": string | null,
"unani_sim": number | null,
"unani_term": string | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "disease_mappings"
        isOneToOne: false
        isSetofReturn: true
      } },
"write_audit":
{ Args: { "action": string,"actor": string,"entity": string,"entity_id"?: string,"meta"?: Json }; Returns: number
                           }
          }
          Enums: {
            "app_role": "doctor"|"patient","appt_status": "pending"|"approved"|"rejected"|"completed"|"cancelled","consult_status": "draft"|"published","identifier_type": "abha"|"abha_address"|"aadhaar_last4"|"gmail"|"phone","link_status": "active"|"revoked"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "app_role": ["doctor", "patient"],"appt_status": ["pending", "approved", "rejected", "completed", "cancelled"],"consult_status": ["draft", "published"],"identifier_type": ["abha", "abha_address", "aadhaar_last4", "gmail", "phone"],"link_status": ["active", "revoked"]
          }
        }
} as const
