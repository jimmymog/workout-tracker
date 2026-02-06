import { useWeeklyStats } from '../hooks/useApi'

interface StatCard {
  label: string
  value: string | number
  icon: string
}

export default function WeeklyStats() {
  const { data, isLoading, error } = useWeeklyStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card h-32 bg-slate-700 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-900/20 border-red-700 text-red-100">
        Failed to load weekly stats: {error.message}
      </div>
    )
  }

  const stats: StatCard[] = [
    {
      label: 'Total Workouts',
      value: data?.totalWorkouts ?? 0,
      icon: '💪',
    },
    {
      label: 'Total Volume',
      value: `${(data?.totalVolume ?? 0).toLocaleString()} lbs`,
      icon: '⚖️',
    },
    {
      label: 'Total Exercises',
      value: data?.totalExercises ?? 0,
      icon: '📊',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="card border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">
                {stat.label}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {stat.value}
              </p>
            </div>
            <div className="text-3xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
