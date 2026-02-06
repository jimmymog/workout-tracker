import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useExerciseProgress, useExerciseNames } from '../hooks/useApi'

type TimeRange = 30 | 90 | 0 // 0 = all time

interface ChartData {
  date: string
  weight: number
  reps: number
  shortDate: string
}

export default function ProgressGraph() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>(90)

  const { data: exerciseNames, isLoading: namesLoading } = useExerciseNames()
  const { data: progressData, isLoading: progressLoading } = useExerciseProgress(
    selectedExercise,
    timeRange === 0 ? 365 * 5 : timeRange,
  )

  const chartData: ChartData[] = (progressData || []).map((point) => ({
    date: point.date,
    weight: point.weight,
    reps: point.reps,
    shortDate: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  const isLoading = namesLoading || progressLoading
  const showChart = selectedExercise && !progressLoading && chartData.length > 0

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Progress Chart</h2>

      {/* Exercise Selector */}
      <div className="mb-4">
        <label className="block text-slate-400 text-sm font-medium mb-2">
          Select Exercise
        </label>
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value || null)}
          className="input-field w-full"
          disabled={namesLoading}
        >
          <option value="">Choose an exercise...</option>
          {exerciseNames?.map((ex) => (
            <option key={ex.name} value={ex.name}>
              {ex.name} ({ex.count})
            </option>
          ))}
        </select>
      </div>

      {/* Time Range Selector */}
      {selectedExercise && (
        <div className="mb-4 flex gap-2 flex-wrap">
          <button
            onClick={() => setTimeRange(30)}
            className={`button text-xs ${
              timeRange === 30
                ? 'button-primary'
                : 'button-secondary'
            }`}
          >
            30d
          </button>
          <button
            onClick={() => setTimeRange(90)}
            className={`button text-xs ${
              timeRange === 90
                ? 'button-primary'
                : 'button-secondary'
            }`}
          >
            90d
          </button>
          <button
            onClick={() => setTimeRange(0)}
            className={`button text-xs ${
              timeRange === 0
                ? 'button-primary'
                : 'button-secondary'
            }`}
          >
            All
          </button>
        </div>
      )}

      {/* Chart or Empty State */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center bg-slate-700 rounded-lg animate-pulse">
          <p className="text-slate-400">Loading...</p>
        </div>
      ) : showChart ? (
        <div className="flex-1 -mx-4 -mb-4">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="shortDate"
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <YAxis
                label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
                stroke="#94a3b8"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) => [`${value.toFixed(1)} lbs`, 'Weight']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                isAnimationActive={true}
                name="Weight"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : selectedExercise ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-slate-400">No data available for this exercise</p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="text-slate-400">Select an exercise to view progress</p>
        </div>
      )}
    </div>
  )
}
