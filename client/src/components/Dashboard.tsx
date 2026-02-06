import { useState } from 'react'
import WeeklyStats from './WeeklyStats'
import RecentWorkouts from './RecentWorkouts'
import ProgressGraph from './ProgressGraph'
import ExerciseDetail from './ExerciseDetail'

type DetailView = 'workouts' | 'exercise'

interface ExerciseDetailState {
  exerciseName: string
}

export default function Dashboard() {
  const [detailView, setDetailView] = useState<DetailView>('workouts')
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDetailState | null>(null)
  const [showRawText, setShowRawText] = useState(false)

  const handleSelectExercise = (exerciseName: string) => {
    setSelectedExercise({ exerciseName })
    setDetailView('exercise')
  }

  const handleBackToWorkouts = () => {
    setDetailView('workouts')
    setSelectedExercise(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Workout Tracker
        </h1>
        <p className="text-slate-400">
          Last updated: {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })}
        </p>
      </div>

      {detailView === 'workouts' ? (
        <>
          {/* Weekly Stats */}
          <div className="mb-8">
            <WeeklyStats />
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Workouts - Wider */}
            <div className="lg:col-span-2">
              <RecentWorkouts
                onSelectExercise={handleSelectExercise}
                showRawText={showRawText}
              />
              {showRawText && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => setShowRawText(false)}
                    className="button button-secondary text-xs"
                  >
                    Hide Raw Data
                  </button>
                </div>
              )}
            </div>

            {/* Progress Graph - Right */}
            <div className="lg:col-span-1">
              <ProgressGraph />
            </div>
          </div>

          {/* Debug Toggle */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="button button-secondary text-xs"
            >
              {showRawText ? 'Hide' : 'Show'} Raw Data
            </button>
          </div>
        </>
      ) : selectedExercise ? (
        <>
          <button
            onClick={handleBackToWorkouts}
            className="button button-secondary mb-6"
          >
            Back to Dashboard
          </button>
          <ExerciseDetail exerciseName={selectedExercise.exerciseName} />
        </>
      ) : null}
    </div>
  )
}
