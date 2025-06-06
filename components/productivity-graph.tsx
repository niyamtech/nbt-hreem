"use client"

import { useMemo } from "react"
import { format, subDays } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { Task } from "@/types"

interface ProductivityGraphProps {
  tasks: Task[]
}

export function ProductivityGraph({ tasks }: ProductivityGraphProps) {
  const productivityData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const dateStr = format(date, "yyyy-MM-dd")

      const dayTasks = tasks.filter((task) => task.date === dateStr)
      const completedTasks = dayTasks.filter((task) => task.completed)

      const completionRate = dayTasks.length > 0 ? (completedTasks.length / dayTasks.length) * 100 : 0

      return {
        date: format(date, "MMM dd"),
        fullDate: dateStr,
        completed: completedTasks.length,
        total: dayTasks.length,
        completionRate: Math.round(completionRate),
      }
    })

    return last7Days
  }, [tasks])

  const averageCompletion = useMemo(() => {
    const totalRate = productivityData.reduce((sum, day) => sum + day.completionRate, 0)
    return Math.round(totalRate / productivityData.length)
  }, [productivityData])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Productivity (Last 7 Days)</CardTitle>
        <div className="text-2xl font-bold text-primary">
          {averageCompletion}%<span className="text-sm font-normal text-muted-foreground ml-2">avg completion</span>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            completionRate: {
              label: "Completion Rate",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => [`${value}%`, "Completion Rate"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        const data = payload[0].payload
                        return `${label}: ${data.completed}/${data.total} tasks`
                      }
                      return label
                    }}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke="var(--color-completionRate)"
                strokeWidth={2}
                dot={{ fill: "var(--color-completionRate)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
