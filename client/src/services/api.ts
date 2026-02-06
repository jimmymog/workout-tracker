const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const envUrl = import.meta.env.VITE_API_URL
    if (envUrl) {
      return envUrl
    }
    return window.location.origin
  }
  return 'http://localhost:3001'
}

export interface Workout {
  id: string
  date: string
  type: string
  exercises: Exercise[]
  notes?: string
}

export interface Exercise {
  id?: string
  name: string
  weight?: number
  reps?: number
  sets?: number
  notes?: string
}

export interface WeeklyStats {
  totalWorkouts: number
  totalVolume: number
  totalExercises: number
  week: string
}

export interface ExerciseProgress {
  date: string
  weight: number
  reps: number
  sets?: number
  notes?: string
}

export interface ExerciseName {
  name: string
  count: number
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

export const api = {
  getWorkouts: async (limit: number = 10, offset: number = 0): Promise<Workout[]> => {
    const url = new URL(`${getBaseUrl()}/api/workouts`)
    url.searchParams.append('limit', limit.toString())
    url.searchParams.append('offset', offset.toString())
    const response = await fetch(url.toString())
    return handleResponse(response)
  },

  getWorkoutById: async (id: string): Promise<Workout> => {
    const response = await fetch(`${getBaseUrl()}/api/workouts/${id}`)
    return handleResponse(response)
  },

  getExerciseProgress: async (name: string, days: number = 90): Promise<ExerciseProgress[]> => {
    const url = new URL(`${getBaseUrl()}/api/exercises/progress`)
    url.searchParams.append('name', name)
    url.searchParams.append('days', days.toString())
    const response = await fetch(url.toString())
    return handleResponse(response)
  },

  getExerciseNames: async (): Promise<ExerciseName[]> => {
    const response = await fetch(`${getBaseUrl()}/api/exercises/names`)
    return handleResponse(response)
  },

  getWeeklyStats: async (): Promise<WeeklyStats> => {
    const response = await fetch(`${getBaseUrl()}/api/stats/weekly`)
    return handleResponse(response)
  },
}
