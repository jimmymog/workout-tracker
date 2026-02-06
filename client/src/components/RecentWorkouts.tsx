import { useState } from 'react'
import { useWorkouts } from '../hooks/useApi'
import { Workout } from '../services/api'

interface RecentWorkoutsProps {
  onSelectExercise: (exerciseName: string) => void
  showRawText: boolean
}

export default function RecentWorkouts({
  onSelectExercise,
  showRawText,
}: RecentWorkoutsProps) {
  const { data: workouts, isLoading, error } = useWorkouts(10)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [limit, setLimit] = useState(10)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="card h-32 bg-slate-700 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-900/20 border-red-700 text-red-100">
        Failed to load workouts: {error.message}
      </div>
    )
  }

  const getWorkoutBadgeClass = (type: string): string => {
    const upperType = type.toUpperCase()
    switch (upperType) {
      case 'UPPER':
        return 'badge-upper'
      case 'LOWER':
        return 'badge-lower'
      case 'PUSH':
        return 'badge-push'
      case 'PULL':
        return 'badge-pull'
      default:
        return 'bg-slate-700 text-slate-100'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      weekday: 'short',
    })
  }

  const isAMRAP = (workout: Workout): boolean => {
    return workout.notes?.toUpperCase().includes('AMRAP') ?? false
  }

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Recent Workouts</h2>

      {!workouts || workouts.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-slate-400">No workouts logged yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="card card-hover group"
              onClick={() => toggleExpanded(workout.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <time className="text-slate-400 text-sm font-medium">
                      {formatDate(workout.date)}
                    </time>
                    <span className={`badge ${getWorkoutBadgeClass(workout.type)}`}>
                      {workout.type.toUpperCase()}
                    </span>
                    {isAMRAP(workout) && (
                      <span className="badge badge-amrap">AMRAP</span>
                    )}
                  </div>
                  {workout.notes && (
                    <p className="text-slate-300 text-sm italic">
                      {workout.notes}
                    </p>
                  )}
                </div>
                <div className="text-slate-500 group-hover:text-slate-300">
                  {expandedId === workout.id ? '▼' : '▶'}
                </div>
              </div>

              {/* Exercises - Always visible summary */}
              <div className="text-slate-400 text-sm mb-0">
                <span className="font-medium">
                  {workout.exercises.length} exercises
                </span>
              </div>

              {/* Expanded Content */}
              {expandedId === workout.id && (
                <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
                  {workout.exercises.map((exercise, idx) => (
                    <div key={idx} className="text-slate-300 text-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectExercise(exercise.name)
                        }}
                        className="text-blue-400 hover:text-blue-300 underline font-medium"
                      >
                        {exercise.name}
                      </button>
                      {exercise.weight && exercise.reps && (
                        <span className="text-slate-400 ml-2">
                          {exercise.weight} lbs × {exercise.reps} reps
                          {exercise.sets && exercise.sets > 1 && (
                            <span> × {exercise.sets} sets</span>
                          )}
                        </span>
                      )}
                      {exercise.notes && (
                        <p className="text-slate-500 text-xs italic ml-2">
                          {exercise.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {showRawText && (
                    <div className="mt-2 pt-2 border-t border-slate-600 bg-slate-900 p-2 rounded text-xs font-mono text-slate-400 max-h-40 overflow-y-auto">
                      <pre>{JSON.stringify(workout, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {workouts.length >= limit && (
            <button
              onClick={() => setLimit(limit + 10)}
              className="button button-secondary w-full mt-4"
            >
              Load More Workouts
            </button>
          )}
        </div>
      )}
    </div>
  )
}
