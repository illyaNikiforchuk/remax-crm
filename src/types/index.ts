export type UserRole = 'admin' | 'seller'
export type UserStatus = 'active' | 'disabled'
export type MarketType = 'primary' | 'secondary'
export type PropertyType = 'apartment' | 'studio' | 'apartments' | 'house' | 'commercial' | 'land'
export type PropertyStatus = 'for_sale' | 'booked' | 'sold' | 'withdrawn'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  role: UserRole
  status: UserStatus
  created_at: string
  created_by: string | null
}

export interface District {
  id: string
  name: string
  created_at: string
}

export interface DriveLink {
  url: string
  label: string
}

export interface Property {
  id: string
  author_id: string
  created_at: string
  updated_at: string
  market_type: MarketType
  property_type: PropertyType
  district_id: string | null
  title: string | null
  address: string | null
  area: number | null
  price: number | null
  price_per_sqm: number | null
  rooms: number | null
  floor: number | null
  total_floors: number | null
  status: PropertyStatus
  developer: string | null
  down_payment: number | null
  installment_months: number | null
  monthly_payment: number | null
  owner_name: string | null
  owner_phone: string | null
  description: string | null
  drive_links: DriveLink[]
  extra_links: DriveLink[]
  district?: District
  author?: Profile
}

export type ClientStatus = 'new' | 'active' | 'closed' | 'lost'

export interface Client {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  budget_min: number | null
  budget_max: number | null
  assigned_to: string | null
  status: ClientStatus
  notes: string | null
  property_types: string[] | null
  district_ids: string[] | null
  created_at: string
  created_by: string | null
  assigned_profile?: Profile
}

export interface DashboardStats {
  total: number
  for_sale: number
  booked: number
  sold: number
  withdrawn: number
  primary: number
  secondary: number
  by_district: { district: string; count: number }[]
  recent: Property[]
}
