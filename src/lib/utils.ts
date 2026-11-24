import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MarketType, PropertyStatus, PropertyType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null): string {
  if (!price) return '—'
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

export function formatArea(area: number | null): string {
  if (!area) return '—'
  return `${area} м²`
}

export const MARKET_TYPE_LABELS: Record<MarketType, string> = {
  primary: 'Первичка',
  secondary: 'Вторичка',
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Квартира',
  studio: 'Студия',
  apartments: 'Апартаменты',
  house: 'Дом',
  commercial: 'Коммерция',
  land: 'Участок',
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  for_sale: 'В продаже',
  booked: 'Бронь',
  sold: 'Продано',
  withdrawn: 'Снято',
}

export const PROPERTY_STATUS_COLORS: Record<PropertyStatus, string> = {
  for_sale: 'bg-green-100 text-green-800',
  booked: 'bg-yellow-100 text-yellow-800',
  sold: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-gray-100 text-gray-600',
}
