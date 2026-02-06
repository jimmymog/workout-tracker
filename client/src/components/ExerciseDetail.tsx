import { useMemo } from 'react'
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
import { useExerciseProgress } from '../hooks/useApi'

interface ExerciseDetailProps {
  exerciseName: string
}

interface ChartData {
  date: string
  weight: number
  reps: number
  sets?: number
  shortDate: string
}

interface ProgressSummary {
  startWeight: number
  currentWeight: number
  improvement: number
  improvementPercent: number
  startDate: string
  currentDate: string
  currentReps: number
  totalSessions: number
}

// Epley formula: weight × (1 + reps/30)
const calculateEstimated1RM = (weight: number, reps: number): number => {
  return weight * (1 + reps / 30)
}

export default function ExerciseDetail({ exerciseName }: ExerciseDetailProps) {
  const { data: progressData, isLoading, error } = useExerciseProgress(
    exerciseName,
    365 * 5,
  )

  const chartData: ChartData[] = (progressData || []).map((point) => ({
    date: point.date,
    weight: point.weight,
    reps: point.reps,
    sets: point.sets,
    shortDate: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }))

  const summary: ProgressSummary | null = useMemo(() => {
    if (!progressData || progressData.length === 0) return null

    const sorted = [...progressData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    const first = sorted[0]
    const last = sorted[sorted.length - 1]

    const startWeight = first.weight
    const currentWeight = last.weight
    const improvement = currentWeight - startWeight
    const improvementPercent = (improvement / startWeight) * 100

    return {
      startWeight,
      currentWeight,
      improvement,
      improvementPercent,
      startDate: first.date,
      currentDate: last.date,
      currentReps: last.reps,
      totalSessions: progressData.length,
    }
  }, [progressData])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="card h-40 bg-slate-700 animate-pulse" />
        <div className="card h-80 bg-slate-700 animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-900/20 border-red-700 text-red-100">
        Failed to load exercise data: {error.message}
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-400">No data available for {exerciseName}</p>
      </div>
    )
  }

  const current1RM = calculateEstimated1RM(summary.currentWeight, summary.currentReps)
  const start1RM = calculateEstimated1RM(summary.startWeight, summary.currentReps)

  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-3xl font-bold text-white">{exerciseName}</h1>

      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-slate-400 text-sm font-medium mb-1">Starting Weight</p>
          <p className="text-2xl font-bold text-white">
            {summary.startWeight} lbs
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(summary.startDate).toLocaleDateString()}
          </p>
        </div>

        <div className="card">
          <p className="text-slate-400 text-sm font-medium mb-1">Current Weight</p>
          <p className="text-2xl font-bold text-white">
            {summary.currentWeight} lbs
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(summary.currentDate).toLocaleDateString()}
          </p>
        </div>

        <div className="card">
          <p className="text-slate-400 text-sm font-medium mb-1">Improvement</p>
          <p className={`text-2xl font-bold ${
            summary.improvement >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {summary.improvement > 0 ? '+' : ''}{summary.improvement.toFixed(1)} lbs
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {summary.improvementPercent > 0 ? '+' : ''}{summary.improvementPercent.toFixed(1)}%
          </p>
        </div>

        <div className="card">
          <p className="text-slate-400 text-sm font-medium mb-1">Est. 1RM</p>
          <p className="text-2xl font-bold text-blue-400">
            {current1RM.toFixed(0)} lbs
          </p>
          <p className="text-xs text-slate-500 mt-1">
            from {start1RM.toFixed(0)} lbs
          </p>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="card h-96">
        <h2 className="text-xl font-bold text-white mb-4">Progress Over Time</h2>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
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
              formatter={(value: number, name: string) => {
                if (name === 'weight') return [`${value.toFixed(1)} lbs`, 'Weight']
                if (name === 'reps') return [`${value} reps`, 'Reps']
                return value
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Weight"
            />
            <Line
              type="monotone"
              dataKey="reps"
              stroke="#10b981"
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Reps"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* History Table */}
      <div className="card overflow-x-auto">
        <h2 className="text-xl font-bold text-white mb-4">Complete History</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left px-3 py-2 font-semibold text-slate-300">
                Date
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-300">
                Weight
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-300">
                Reps
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-300">
                Sets
              </th>
              <th className="text-right px-3 py-2 font-semibold text-slate-300">
                Est. 1RM
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-700 hover:bg-slate-700/50"
              >
                <td className="px-3 py-2 text-slate-300">
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td className="text-right px-3 py-2 text-white font-semibold">
                  {row.weight} lbs
                </td>
                <td className="text-right px-3 py-2 text-slate-300">
                  {row.reps}
                </td>
                <td className="text-right px-3 py-2 text-slate-300">
                  {row.sets || '-'}
                </td>
                <td className="text-right px-3 py-2 text-blue-400 font-semibold">
                  {calculateEstimated1RM(row.weight, row.reps).toFixed(0)} lbs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Sessions</p>
          <p className="text-2xl font-bold text-white">
            {summary.totalSessions}
          </p>
        </div>

        <div className="card">
          <p className="text-slate-400 text-sm font-medium mb-1">Avg Weight</p>
          <p className="text-2xl font-bold text-white">
            {(
              chartData.reduce((sum, d) => sum + d.weight, 0) / chartData.length
            ).toFixed(1)} lbs
          </p>
        </div>
      </div>
    </div>
  )
}
