export interface Poll {
  id: string
  title: string
  description: string | null
  created_at: string
  user_id: string | null
  category: string | null
  tags: string[] | null
  expires_at: string | null
  is_active: boolean
  is_private: boolean
  allow_multiple_votes: boolean
}

export interface PollCategory {
  id: string
  name: string
  description: string | null
  color: string | null
  created_at: string
}

export interface Option {
  id: string
  poll_id: string
  text: string
  created_at: string
}

export interface Vote {
  id: string
  option_id: string
  user_id: string | null
  anonymous_id: string | null
  created_at: string
}

export interface Comment {
  id: string
  poll_id: string
  user_id: string | null
  content: string
  created_at: string
}

export interface PollView {
  id: string
  poll_id: string
  user_id: string | null
  anonymous_id: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface PollReport {
  id: string
  poll_id: string
  reporter_user_id: string | null
  reporter_anonymous_id: string | null
  reason: string
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  user_id: string
  role: string
  permissions: string[] | null
  created_at: string
}

export interface PollWithOptions extends Poll {
  options: Option[]
}

export interface PollWithOptionsAndVotes extends PollWithOptions {
  options: (Option & { votes: number })[]
  total_votes: number
}

export interface PollAnalytics {
  total_votes: number
  unique_voters: number
  total_views: number
  unique_viewers: number
  votes_over_time: { date: string; count: number }[]
  votes_by_option: { option_id: string; option_text: string; votes: number }[]
}
