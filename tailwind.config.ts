import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			// Enhanced BuildEase typography scale (16px base for construction industry readability)
			fontSize: {
				xs: ['0.75rem', { lineHeight: '1.125rem', fontWeight: '400' }],
				sm: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
				base: ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
				lg: ['1.125rem', { lineHeight: '1', fontWeight: '400' }],
				xl: ['1.25rem', { lineHeight: '1', fontWeight: '500' }],
				'2xl': ['1.5rem', { lineHeight: '1', fontWeight: '600' }],
				'3xl': ['1.875rem', { lineHeight: '1', fontWeight: '600' }],
				'4xl': ['2.25rem', { lineHeight: '1', fontWeight: '700' }],
				'5xl': ['3rem', { lineHeight: '1', fontWeight: '700' }],
				'6xl': ['3.75rem', { lineHeight: '1', fontWeight: '800' }],
				// Construction-specific sizes
				'construction-caption': ['0.8125rem', { lineHeight: '1', fontWeight: '500' }],
				'construction-body': ['0.9375rem', { lineHeight: '1', fontWeight: '400' }],
				'construction-heading': ['1.375rem', { lineHeight: '1', fontWeight: '600' }],
			},
			// Consistent spacing scale
			spacing: {
				'4.5': '1.125rem',
				'content': '1.5rem',
				'content-lg': '2rem',
				'content-xl': '2.5rem',
				'section': '3rem',
				'section-lg': '4rem',
				'safe': 'env(safe-area-inset-bottom)',
			},
			// Add specific line heights
			lineHeight: {
				'tight': '1.2',
				'snug': '1.375',
				'normal': '1.5',
				'relaxed': '1.625',
				'loose': '2',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				
				// Enhanced BuildEase Construction Industry Colors
				buildease: {
					// Primary blue - Enhanced warm blue for trust and professionalism
					blue: {
						50: '#eff8ff',
						100: '#dbeefe',
						200: '#bfe2fd',
						300: '#93d1fc',
						400: '#60b6f8',
						500: '#3b9df4',
						600: '#2B6CB0', // Primary BuildEase blue
						700: '#1d5a9a',
						800: '#1e4f7e',
						900: '#1e4268',
						950: '#172a44',
					},
					// Accent orange - Warm orange for calls-to-action
					orange: {
						50: '#fff7ed',
						100: '#ffedd5',
						200: '#fed7aa',
						300: '#fdba74',
						400: '#fb923c',
						500: '#ED8936', // Primary BuildEase orange
						600: '#ea580c',
						700: '#c2410c',
						800: '#9a3412',
						900: '#7c2d12',
						950: '#431407',
					},
					// Earth tones for construction context
					earth: {
						50: '#f8f7f5',
						100: '#f0eee9',
						200: '#e1ddd3',
						300: '#cdc5b4',
						400: '#b5a892',
						500: '#9d8b73',
						600: '#8a7964',
						700: '#726354',
						800: '#5e5347',
						900: '#4e453c',
						950: '#28241f',
					},
				},
				
				// Construction theme colors (existing)
				deepblue: {
					DEFAULT: 'hsl(var(--deepblue))',
					light: 'hsl(var(--deepblue-light))',
					dark: 'hsl(var(--deepblue-dark))'
				},
				darkgreen: {
					DEFAULT: 'hsl(var(--darkgreen))',
					light: 'hsl(var(--darkgreen-light))',
					dark: 'hsl(var(--darkgreen-dark))'
				},
				burntorange: {
					DEFAULT: 'hsl(var(--burntorange))',
					light: 'hsl(var(--burntorange-light))',
					dark: 'hsl(var(--burntorange-dark))'
				},
				lightgray: {
					DEFAULT: 'hsl(var(--lightgray))',
					dark: 'hsl(var(--lightgray-dark))',
					darker: 'hsl(var(--lightgray-darker))'
				},
				
				// Enhanced primary system using BuildEase blue
				primary: {
					DEFAULT: '#2B6CB0', // BuildEase blue
					foreground: 'hsl(var(--primary-foreground))',
					lighter: '#3b9df4',
					darker: '#1d5a9a'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				
				// Enhanced accent using BuildEase orange
				accent: {
					DEFAULT: '#ED8936', // BuildEase orange
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				
				// Enhanced status colors with construction industry focus
				status: {
					// Pending - Blue for pending tasks
					pending: {
						DEFAULT: '#2B6CB0', // BuildEase blue
						light: '#3b9df4',
						dark: '#1d5a9a',
						foreground: '#ffffff'
					},
					// In Progress - Orange for active work
					'in-progress': {
						DEFAULT: '#ED8936', // BuildEase orange
						light: '#fb923c',
						dark: '#ea580c',
						foreground: '#ffffff'
					},
					// Completed - Green for finished work
					completed: {
						DEFAULT: '#059669', // Professional green
						light: '#10b981',
						dark: '#047857',
						foreground: '#ffffff'
					}
				},
				success: {
					DEFAULT: '#059669', // Aligned with completed status
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: '#ED8936', // Aligned with in-progress status
					foreground: 'hsl(var(--warning-foreground))'
				}
			},
			boxShadow: {
				'card': 'var(--card-shadow)',
				'card-hover': 'var(--card-shadow-hover)',
				'3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.25)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'slow-spin': {
					from: {
						transform: 'rotate(0deg)'
					},
					to: {
						transform: 'rotate(360deg)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'slow-spin': 'slow-spin 20s linear infinite',
				'float': 'float 6s ease-in-out infinite'
			},
			backgroundBlendMode: {
				'overlay': 'overlay',
			}
		}
	},
	plugins: [animate],
} satisfies Config;
