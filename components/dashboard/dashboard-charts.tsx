'use client'

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const CHART_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

const docConfig = {
  resumes: { label: 'Resumes', color: 'var(--chart-1)' },
  letters: { label: 'Cover Letters', color: 'var(--chart-3)' },
} satisfies ChartConfig

export function DashboardCharts({
  docsByDay,
  jobStatus,
}: {
  docsByDay: { day: string; resumes: number; letters: number }[]
  jobStatus: { name: string; count: number; color?: string }[]
}) {
  const jobConfig = Object.fromEntries(
    jobStatus.map((s, i) => [s.name, { label: s.name, color: s.color || CHART_COLORS[i % CHART_COLORS.length] }])
  ) satisfies ChartConfig

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Job applications</CardTitle>
          <CardDescription>Status of every job on your tracker board</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={jobConfig} className="mx-auto aspect-square max-h-[260px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie data={jobStatus} dataKey="count" nameKey="name" innerRadius={60} strokeWidth={4}>
                {jobStatus.map((s, i) => (
                  <Cell key={s.name} fill={s.color || CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Resumes and cover letters created per day, last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={docConfig} className="h-[260px] w-full">
            <BarChart accessibilityLayer data={docsByDay}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} minTickGap={20} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="resumes" stackId="docs" fill="var(--chart-1)" radius={4} />
              <Bar dataKey="letters" stackId="docs" fill="var(--chart-3)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
