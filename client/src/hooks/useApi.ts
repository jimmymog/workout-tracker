import { useQuery, UseQueryResult } from '@tanstack/react-query'
import {
  api,
  Workout,
  ExerciseProgress,
  ExerciseName,
  WeeklyStats,
} from '../services/api'

export const useWorkouts = (limit: number = 10): UseQueryResult<Workout[], Error> => {
  return useQuery({
    queryKey: ['workouts', limit],
    queryFn: () => api.getWorkouts(limit),
    staleTime: 30000,
    refetchInterval: 30000,
  })
}

export const useWorkoutById = (id: string): UseQueryResult<Workout, Error> => {
  return useQuery({
    queryKey: ['workout', id],
    queryFn: () => api.getWorkoutById(id),
    staleTime: 60000,
  })
}

export const useExerciseProgress = (
  name: string | null,
  days: number = 90,
): UseQueryResult<ExerciseProgress[], Error> => {
  return useQuery({
    queryKey: ['exerciseProgress', name, days],
    queryFn: () => api.getExerciseProgress(name!, days),
    enabled: !!name,
    staleTime: 60000,
  })
}

export const useExerciseNames = (): UseQueryResult<ExerciseName[], Error> => {
  return useQuery({
    queryKey: ['exerciseNames'],
    queryFn: () => api.getExerciseNames(),
    staleTime: 300000,
  })
}

export const useWeeklyStats = (): UseQueryResult<WeeklyStats, Error> => {
  return useQuery({
    queryKey: ['weeklyStats'],
    queryFn: () => api.getWeeklyStats(),
    staleTime: 60000,
    refetchInterval: 60000,
  })
}
