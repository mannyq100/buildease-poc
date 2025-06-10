import { ReactNode } from 'react'

export interface Feature {
  title: string
  description: string
  icon: ReactNode
}

export interface FeatureData {
  title: string
  description: string
  iconPath: string
}

export interface Step {
  number: number
  title: string
  description: string
}

export interface Stat {
  value: string
  label: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  location: string
  content: string
  avatar: string
}