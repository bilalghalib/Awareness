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

export enum IssueType {
  Environmental = 'environmental',
  Humanitarian = 'humanitarian',
  Systemic = 'systemic',
  Political = 'political',
  Economic = 'economic'
}

export enum IssueStatus {
  Active = 'active',
  Monitoring = 'monitoring',
  Resolved = 'resolved',
  Escalating = 'escalating'
}

export enum ContentTier {
  Awareness = 1, // Always show - dignity-preserving
  Understanding = 2, // Context - opt-in
  Evidence = 3 // Validators only - may include graphic
}

export enum ImplicationLevel {
  Individual = 'individual',
  Family = 'family',
  Community = 'community',
  Culture = 'culture',
  Country = 'country',
  Systemic = 'systemic'
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

export interface ContentPreferences {
  show_graphic_content: boolean;
  auto_expand_context: boolean;
  require_closing_ritual: boolean;
  content_tier_preference: ContentTier;
}

export interface InterpretationEntry {
  interpretation_text: string;
  source_name?: string;
  source_url?: string;
  perspective_type?: string;
}

export interface MemorialData {
  names?: Array<{
    name: string;
    age?: number;
    remembered_for?: string;
  }>;
  total_count?: number;
  memorial_message?: string;
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
  content_preferences: ContentPreferences;
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

  // Issues model (events become "moments" within issues)
  issue_id: string | null;

  // Content protection
  content_tier: ContentTier;
  has_graphic_content: boolean;
  content_warnings: string[] | null;
  show_memorial_view: boolean;
  memorial_data: MemorialData | null;

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

export interface Issue {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: IssueType;
  current_status: IssueStatus;
  started_at: string | null;
  resolved_at: string | null;
  what_we_know: string | null;
  what_we_dont_know: string | null;
  what_it_means: InterpretationEntry[];
  header_image_url: string | null;
  location_data: any | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface IssueFollower {
  id: string;
  issue_id: string;
  user_id: string;
  notify_on_moments: boolean;
  notify_on_campaigns: boolean;
  first_followed_at: string;
  last_engaged_at: string;
}

export interface PackIssueFocus {
  id: string;
  pack_id: string;
  issue_id: string;
  priority: 'primary' | 'secondary' | 'monitoring';
  started_focusing_at: string;
  last_action_at: string;
}

export interface MemorialEntry {
  id: string;
  event_id: string;
  name: string | null;
  age: number | null;
  description: string | null;
  remembered_for: string | null;
  photo_url: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Interpretation {
  id: string;
  issue_id: string | null;
  event_id: string | null;
  interpretation_text: string;
  source_name: string | null;
  source_url: string | null;
  perspective_type: string | null;
  verified: boolean;
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  created_by: string | null;
}

export interface SensemakingEntry {
  id: string;
  issue_id: string;
  pack_id: string;
  user_id: string;
  question: string;
  interpretation: string;
  reasoning: string | null;
  actions_suggested: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ImplicationLevelRecord {
  id: string;
  issue_id: string;
  level: ImplicationLevel;
  display_order: number;
  implication_prompt: string;
  implication_description: string | null;
  implication_examples: string[] | null;
  action_prompt: string;
  action_description: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface LevelAction {
  id: string;
  implication_level_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'moderate' | 'challenging' | 'requires_commitment';
  time_commitment: string | null;
  resources: {
    links?: Array<{ title: string; url: string }>;
    templates?: Array<{ title: string; content: string }>;
    guides?: Array<{ title: string; url: string }>;
  } | null;
  times_taken: number;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface UserLevelEngagement {
  id: string;
  user_id: string;
  issue_id: string;
  level: ImplicationLevel;
  first_viewed_at: string;
  last_engaged_at: string;
  actions_taken_count: number;
  my_implication_notes: string | null;
  my_action_commitments: string[] | null;
  shared_with_pack: boolean;
  pack_id: string | null;
}

export interface ActionCompletion {
  id: string;
  user_id: string;
  level_action_id: string;
  completed_at: string;
  reflection: string | null;
  rating: number | null;
  would_recommend: boolean | null;
  completed_with_pack: boolean;
  pack_id: string | null;
  coordinated_with_user_ids: string[] | null;
  proof_url: string | null;
  proof_image_url: string | null;
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

export interface IssueWithStats extends Issue {
  follower_count: number;
  pack_count: number;
  moment_count: number;
}

export interface MomentWithIssueContext extends Event {
  issue_title: string | null;
  issue_type: IssueType | null;
  issue_status: IssueStatus | null;
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

export interface IssueWithDetails extends Issue {
  followers?: IssueFollower[];
  focused_packs?: PackIssueFocus[];
  moments?: Event[];
  interpretations?: Interpretation[];
  follower_count?: number;
  pack_count?: number;
}

export interface EventWithIssue extends Event {
  issue?: Issue;
}

export interface InterpretationWithAuthor extends Interpretation {
  author?: Profile;
  verifier?: Profile;
}

export interface SensemakingWithDetails extends SensemakingEntry {
  author: Profile;
  pack: Pack;
  issue: Issue;
}

export interface ImplicationLevelWithActions extends ImplicationLevelRecord {
  actions?: LevelAction[];
  action_count?: number;
  completion_count?: number;
}

export interface LevelActionWithCompletions extends LevelAction {
  completions?: ActionCompletion[];
  user_completion?: ActionCompletion; // Current user's completion if any
}

export interface ActionCompletionWithDetails extends ActionCompletion {
  user: Profile;
  action: LevelAction;
  coordinated_with?: Profile[];
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

export interface CreateIssueRequest {
  title: string;
  slug: string;
  description: string;
  type: IssueType;
  started_at?: string;
  what_we_know?: string;
  what_we_dont_know?: string;
  what_it_means?: InterpretationEntry[];
  header_image_url?: string;
  location_data?: any;
}

export interface FollowIssueRequest {
  issue_id: string;
  notify_on_moments?: boolean;
  notify_on_campaigns?: boolean;
}

export interface CreateInterpretationRequest {
  issue_id?: string;
  event_id?: string;
  interpretation_text: string;
  source_name?: string;
  source_url?: string;
  perspective_type?: string;
}

export interface CreateSensemakingRequest {
  issue_id: string;
  pack_id: string;
  question: string;
  interpretation: string;
  reasoning?: string;
  actions_suggested?: string[];
}

export interface CreateMemorialEntryRequest {
  event_id: string;
  name?: string;
  age?: number;
  description?: string;
  remembered_for?: string;
  photo_url?: string;
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

export interface IssueState {
  issues: IssueWithStats[];
  following: string[]; // issue IDs
  pack_focus: PackIssueFocus[];
  loading: boolean;
  error: string | null;
}

export interface ContentProtectionState {
  preferences: ContentPreferences;
  show_warning: boolean;
  warning_acknowledged: Record<string, boolean>; // event ID -> acknowledged
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
  | 'audit_log'
  | 'issues'
  | 'issue_followers'
  | 'pack_issue_focus'
  | 'memorial_entries'
  | 'interpretations'
  | 'sensemaking_entries'
  | 'implication_levels'
  | 'level_actions'
  | 'user_level_engagement'
  | 'action_completions';

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
      issues: {
        Row: Issue;
        Insert: InsertType<Issue>;
        Update: UpdateType<Issue>;
      };
      issue_followers: {
        Row: IssueFollower;
        Insert: InsertType<IssueFollower>;
        Update: UpdateType<IssueFollower>;
      };
      pack_issue_focus: {
        Row: PackIssueFocus;
        Insert: InsertType<PackIssueFocus>;
        Update: UpdateType<PackIssueFocus>;
      };
      memorial_entries: {
        Row: MemorialEntry;
        Insert: InsertType<MemorialEntry>;
        Update: UpdateType<MemorialEntry>;
      };
      interpretations: {
        Row: Interpretation;
        Insert: InsertType<Interpretation>;
        Update: UpdateType<Interpretation>;
      };
      sensemaking_entries: {
        Row: SensemakingEntry;
        Insert: InsertType<SensemakingEntry>;
        Update: UpdateType<SensemakingEntry>;
      };
      implication_levels: {
        Row: ImplicationLevelRecord;
        Insert: InsertType<ImplicationLevelRecord>;
        Update: UpdateType<ImplicationLevelRecord>;
      };
      level_actions: {
        Row: LevelAction;
        Insert: InsertType<LevelAction>;
        Update: UpdateType<LevelAction>;
      };
      user_level_engagement: {
        Row: UserLevelEngagement;
        Insert: InsertType<UserLevelEngagement>;
        Update: UpdateType<UserLevelEngagement>;
      };
      action_completions: {
        Row: ActionCompletion;
        Insert: InsertType<ActionCompletion>;
        Update: UpdateType<ActionCompletion>;
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
      issues_with_stats: {
        Row: IssueWithStats;
      };
      moments_with_issue_context: {
        Row: MomentWithIssueContext;
      };
    };
  };
}
