/**
 * AWARENESS PLATFORM - TYPESCRIPT TYPES
 * Generated from Supabase schema
 * These types provide end-to-end type safety from database to UI
 */

// ============================================
// ENUMS
// ============================================

export enum UserRole {
  Member = 'member',
  Validator = 'validator',
  KindnessResponder = 'kindness_responder',
  Admin = 'admin'
}

export enum EventStatus {
  Pending = 'pending',
  Validating = 'validating',
  Verified = 'verified',
  Disputed = 'disputed',
  Rejected = 'rejected',
  Archived = 'archived'
}

export enum VerificationVote {
  Valid = 'valid',
  Invalid = 'invalid',
  Unsure = 'unsure',
  NeedsMoreInfo = 'needs_more_info'
}

export enum ResponseType {
  Donation = 'donation',
  Vigil = 'vigil',
  Translation = 'translation',
  Amplification = 'amplification',
  Organizing = 'organizing',
  Other = 'other'
}

export enum NotificationType {
  Thermal = 'thermal',
  Push = 'push',
  SMS = 'sms',
  Email = 'email'
}

export enum PresenceStatus {
  Active = 'active',
  Away = 'away',
  Reflecting = 'reflecting',
  Responding = 'responding'
}

// ============================================
// JSONB TYPE INTERFACES
// ============================================

export interface NotificationPreferences {
  thermal: boolean;
  push: boolean;
  sms: boolean;
  email: boolean;
  quiet_hours: {
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface ResponseCapacity {
  weekly_response_limit: number;
  current_week_count: number;
  last_response_at: string | null;
  burnout_risk_score: number; // 0-100
}

export interface ResponsePrinciples {
  [key: string]: any; // Flexible structure for Pack-specific values
}

export interface InvestigationStep {
  step: number;
  action: string;
  details: string;
  sources?: string[];
  timestamp: string;
}

export interface EventMetadata {
  original_tweet_id?: string;
  original_poster?: string;
  tweet_text?: string;
  media_urls?: string[];
  hashtags?: string[];
  [key: string]: any; // Extensible
}

export interface Casualties {
  killed?: number;
  injured?: number;
  missing?: number;
  displaced?: number;
}

export interface ActionSteps {
  steps: Array<{
    order: number;
    instruction: string;
    optional?: boolean;
  }>;
  estimated_time: string;
  estimated_cost?: string;
  can_be_done_remotely: boolean;
  required_skills?: string[];
}

export interface ImpactEstimate {
  people_helped?: number;
  funds_raised?: number;
  awareness_reached?: number;
  [key: string]: number | undefined; // Extensible
}

export interface DeviceMetadata {
  battery_level?: number;
  temperature?: number;
  firmware_version?: string;
  last_sync?: string;
  [key: string]: any;
}

// ============================================
// DATABASE TABLE TYPES
// ============================================

export interface Profile {
  id: string; // UUID
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  roles: UserRole[];
  timezone: string;
  notification_preferences: NotificationPreferences;
  response_capacity: ResponseCapacity;
  created_at: string;
  updated_at: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string | null;
  timezone: string;
  region: string | null;
  coordinates: string | null; // PostGIS GEOGRAPHY(POINT)
  sync_time: string; // TIME
  member_capacity: number;
  current_member_count: number;
  values_statement: string | null;
  response_principles: ResponsePrinciples | null;
  created_at: string;
  updated_at: string;
}

export interface PackMembership {
  id: string;
  user_id: string;
  pack_id: string;
  role: UserRole;
  joined_at: string;
  current_presence: PresenceStatus;
  last_active_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  coordinates: string | null; // PostGIS GEOGRAPHY(POINT)
  occurred_at: string;
  source_type: string;
  source_url: string | null;
  source_metadata: EventMetadata | null;
  status: EventStatus;
  assigned_validator_id: string | null;
  verification_deadline: string | null;
  verification_confidence_score: number; // 0.0 to 1.0
  verification_trail: InvestigationStep[];
  estimated_casualties: Casualties | null;
  published_at: string | null;
  published_to_pack_ids: string[] | null;
  archived_at: string | null;
  archive_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Verification {
  id: string;
  event_id: string;
  validator_id: string;
  vote: VerificationVote;
  confidence_level: number; // 1-5
  investigation_steps: InvestigationStep[];
  evidence_urls: string[] | null;
  evidence_notes: string | null;
  questions_for_other_validators: string | null;
  reasoning: string;
  submitted_at: string;
  updated_at: string;
}

export interface VerificationDiscussion {
  id: string;
  event_id: string;
  user_id: string;
  message: string;
  parent_message_id: string | null;
  created_at: string;
}

export interface Response {
  id: string;
  event_id: string;
  user_id: string;
  pack_id: string;
  response_type: ResponseType;
  description: string;
  proof_url: string | null;
  proof_image_url: string | null;
  is_public: boolean;
  is_anonymous: boolean;
  building_on_response_id: string | null;
  coordinated_with_user_ids: string[] | null;
  estimated_impact: ImpactEstimate | null;
  created_at: string;
}

export interface ResponseTemplate {
  id: string;
  title: string;
  description: string;
  response_type: ResponseType;
  action_steps: ActionSteps;
  times_used: number;
  average_rating: number;
  created_by: string | null;
  created_at: string;
}

export interface CollectiveAction {
  id: string;
  event_id: string;
  pack_id: string;
  title: string;
  description: string;
  organizer_id: string;
  template_id: string | null;
  target_participant_count: number | null;
  current_participant_count: number;
  starts_at: string;
  ends_at: string | null;
  status: string; // planning, active, completed, cancelled
  outcome_summary: string | null;
  total_impact: ImpactEstimate | null;
  created_at: string;
  updated_at: string;
}

export interface CollectiveActionParticipant {
  id: string;
  collective_action_id: string;
  user_id: string;
  role: string; // organizer, participant, supporter
  commitment_level: number; // 1-5
  joined_at: string;
}

export interface Reflection {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  emotions: string[] | null;
  emotional_intensity: number; // 1-5
  visibility: string; // private, pack, public
  pack_id: string | null;
  parent_reflection_id: string | null;
  created_at: string;
}

export interface PackPresence {
  id: string;
  pack_id: string;
  user_id: string;
  event_id: string | null;
  status: PresenceStatus;
  last_heartbeat_at: string;
  current_activity: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  event_id: string | null;
  type: NotificationType;
  title: string;
  body: string;
  sent_at: string | null;
  delivered_at: string | null;
  read_at: string | null;
  device_id: string | null;
  device_metadata: DeviceMetadata | null;
  created_at: string;
}

export interface EventImpactTracking {
  id: string;
  event_id: string;
  initial_damage_score: number; // 0-100
  current_damage_score: number; // 0-100
  response_count: number;
  healing_rate: number;
  started_tracking_at: string;
  last_updated_at: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  actor_id: string | null;
  actor_role: UserRole | null;
  old_values: any | null;
  new_values: any | null;
  created_at: string;
}

// ============================================
// VIEW TYPES
// ============================================

export interface ActiveEventView extends Event {
  verification_count: number;
  response_count: number;
  current_damage_score: number;
}

export interface PackActivityView {
  pack_id: string;
  pack_name: string;
  total_members: number;
  active_members: number;
  responses_this_week: number;
}

export interface UserEngagementView {
  user_id: string;
  username: string;
  total_responses: number;
  responses_this_week: number;
  responses_this_month: number;
  last_response_at: string | null;
  burnout_risk: 'low' | 'medium' | 'high';
}

// ============================================
// RELATIONS (with joined data)
// ============================================

export interface EventWithDetails extends Event {
  verifications?: Verification[];
  responses?: Response[];
  impact_tracking?: EventImpactTracking;
  assigned_validator?: Profile;
}

export interface ResponseWithUser extends Response {
  user: Profile;
  building_on?: Response;
  coordinated_with?: Profile[];
}

export interface PackWithMembers extends Pack {
  members?: (PackMembership & { profile: Profile })[];
  active_presence?: PackPresence[];
}

export interface VerificationWithValidator extends Verification {
  validator: Profile;
  discussions?: VerificationDiscussion[];
}

export interface CollectiveActionWithDetails extends CollectiveAction {
  organizer: Profile;
  participants: (CollectiveActionParticipant & { profile: Profile })[];
  template?: ResponseTemplate;
  event: Event;
}

export interface ReflectionWithAuthor extends Reflection {
  author: Profile;
  replies?: ReflectionWithAuthor[];
}

// ============================================
// REQUEST/RESPONSE TYPES (for API endpoints)
// ============================================

export interface CreateEventRequest {
  title: string;
  description?: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  occurred_at: string;
  source_type: string;
  source_url?: string;
  source_metadata?: EventMetadata;
  estimated_casualties?: Casualties;
}

export interface CreateVerificationRequest {
  event_id: string;
  vote: VerificationVote;
  confidence_level: number;
  investigation_steps: InvestigationStep[];
  evidence_urls?: string[];
  evidence_notes?: string;
  questions_for_other_validators?: string;
  reasoning: string;
}

export interface CreateResponseRequest {
  event_id: string;
  pack_id: string;
  response_type: ResponseType;
  description: string;
  proof_url?: string;
  proof_image_url?: string;
  is_public?: boolean;
  is_anonymous?: boolean;
  building_on_response_id?: string;
  coordinated_with_user_ids?: string[];
  estimated_impact?: ImpactEstimate;
}

export interface CreateCollectiveActionRequest {
  event_id: string;
  pack_id: string;
  title: string;
  description: string;
  template_id?: string;
  target_participant_count?: number;
  starts_at: string;
  ends_at?: string;
}

export interface CreateReflectionRequest {
  event_id: string;
  content: string;
  emotions?: string[];
  emotional_intensity: number;
  visibility: 'private' | 'pack' | 'public';
  pack_id?: string;
  parent_reflection_id?: string;
}

export interface UpdatePresenceRequest {
  pack_id: string;
  event_id?: string;
  status: PresenceStatus;
  current_activity?: string;
}

// ============================================
// FRONTEND STATE TYPES
// ============================================

export interface UserState {
  profile: Profile | null;
  packs: Pack[];
  current_pack: Pack | null;
  loading: boolean;
  error: string | null;
}

export interface EventFeedState {
  events: ActiveEventView[];
  loading: boolean;
  error: string | null;
  filter: {
    status?: EventStatus[];
    pack_id?: string;
    date_range?: { start: string; end: string };
  };
}

export interface PackPresenceState {
  pack_id: string;
  members: (PackPresence & { profile: Profile })[];
  current_event_id: string | null;
}

export interface VerificationWorkflowState {
  current_event: Event | null;
  investigation_steps: InvestigationStep[];
  evidence: string[];
  current_step: number;
  confidence: number;
}

export interface CollectiveActionState {
  active_actions: CollectiveActionWithDetails[];
  participating_in: string[]; // action IDs
  organizing: string[]; // action IDs
}

// ============================================
// UTILITY TYPES
// ============================================

export type DatabaseTable =
  | 'profiles'
  | 'packs'
  | 'pack_memberships'
  | 'events'
  | 'verifications'
  | 'verification_discussions'
  | 'responses'
  | 'response_templates'
  | 'collective_actions'
  | 'collective_action_participants'
  | 'reflections'
  | 'pack_presence'
  | 'notifications'
  | 'event_impact_tracking'
  | 'audit_log';

export type InsertType<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateType<T> = Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// SUPABASE CLIENT TYPE AUGMENTATION
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: InsertType<Profile>;
        Update: UpdateType<Profile>;
      };
      packs: {
        Row: Pack;
        Insert: InsertType<Pack>;
        Update: UpdateType<Pack>;
      };
      pack_memberships: {
        Row: PackMembership;
        Insert: InsertType<PackMembership>;
        Update: UpdateType<PackMembership>;
      };
      events: {
        Row: Event;
        Insert: InsertType<Event>;
        Update: UpdateType<Event>;
      };
      verifications: {
        Row: Verification;
        Insert: InsertType<Verification>;
        Update: UpdateType<Verification>;
      };
      verification_discussions: {
        Row: VerificationDiscussion;
        Insert: InsertType<VerificationDiscussion>;
        Update: UpdateType<VerificationDiscussion>;
      };
      responses: {
        Row: Response;
        Insert: InsertType<Response>;
        Update: UpdateType<Response>;
      };
      response_templates: {
        Row: ResponseTemplate;
        Insert: InsertType<ResponseTemplate>;
        Update: UpdateType<ResponseTemplate>;
      };
      collective_actions: {
        Row: CollectiveAction;
        Insert: InsertType<CollectiveAction>;
        Update: UpdateType<CollectiveAction>;
      };
      collective_action_participants: {
        Row: CollectiveActionParticipant;
        Insert: InsertType<CollectiveActionParticipant>;
        Update: UpdateType<CollectiveActionParticipant>;
      };
      reflections: {
        Row: Reflection;
        Insert: InsertType<Reflection>;
        Update: UpdateType<Reflection>;
      };
      pack_presence: {
        Row: PackPresence;
        Insert: InsertType<PackPresence>;
        Update: UpdateType<PackPresence>;
      };
      notifications: {
        Row: Notification;
        Insert: InsertType<Notification>;
        Update: UpdateType<Notification>;
      };
      event_impact_tracking: {
        Row: EventImpactTracking;
        Insert: InsertType<EventImpactTracking>;
        Update: UpdateType<EventImpactTracking>;
      };
      audit_log: {
        Row: AuditLog;
        Insert: InsertType<AuditLog>;
        Update: UpdateType<AuditLog>;
      };
    };
    Views: {
      active_events_view: {
        Row: ActiveEventView;
      };
      pack_activity_view: {
        Row: PackActivityView;
      };
      user_engagement_view: {
        Row: UserEngagementView;
      };
    };
  };
}
