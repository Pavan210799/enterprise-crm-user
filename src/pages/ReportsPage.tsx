import { useState } from 'react'
import { CheckSquare, CircleDollarSign, Download, Percent, Trophy } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectPerformance } from '@/features/workspace/workspaceSelectors'
import { selectDealOutcomes, selectLeadRates, selectLeadSources, selectTaskStats } from '@/features/workspace/reportSelectors'
import { pushToast } from '@/features/toasts/toastsSlice'
import { StatTile } from '@/components/common/StatTile'
import { Button } from '@/components/ui/Button'
import { RangeToggle } from '@/components/charts/RangeToggle'
import { RevenueTargetChart } from '@/components/reports/RevenueTargetChart'
import { TargetAttainment } from '@/components/reports/TargetAttainment'
import { ConversionTrendChart } from '@/components/reports/ConversionTrendChart'
import { ConversionFunnel } from '@/components/reports/ConversionFunnel'
import { TaskStatsChart } from '@/components/reports/TaskStatsChart'
import { LeadSourcesChart } from '@/components/reports/LeadSourcesChart'
import { ActivityMixChart } from '@/components/reports/ActivityMixChart'
import { ClosedDealsTable } from '@/components/reports/ClosedDealsTable'
import { downloadCsv, type CsvCell } from '@/lib/csv'
import { formatCompactCurrency } from '@/lib/format'

type Range = 3 | 6 | 12

const RANGES = [
  { value: 3, label: '3M' },
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
] as const

export default function ReportsPage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [range, setRange] = useState<Range>(6)
  const [exporting, setExporting] = useState(false)
  const months = useAppSelector(selectPerformance).slice(-range)
  const rates = useAppSelector(selectLeadRates)
  const outcomes = useAppSelector(selectDealOutcomes)
  const tasks = useAppSelector(selectTaskStats)
  const sources = useAppSelector(selectLeadSources)

  const revenue = months.reduce((sum, point) => sum + point.revenue, 0)
  const target = months.reduce((sum, point) => sum + point.target, 0)
  const attainment = target ? Math.round((revenue / target) * 100) : 0

  async function handleExport() {
    setExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      const rows: CsvCell[][] = [
        ['NexRel personal report', user?.name ?? '', `Last ${range} months`, new Date().toLocaleDateString('en-US')],
        [],
        ['Metric', 'Value'],
        ['Won revenue', revenue],
        ['Target', target],
        ['Target attainment %', attainment],
        ['Lead conversion %', rates.conversion],
        ['Completed deals', outcomes.wonCount],
        ['Win rate %', outcomes.winRate],
        ['Task completion %', tasks.completionRate],
        [],
        ['Month', 'Revenue', 'Target', 'New leads', 'Converted'],
        ...months.map((point) => [point.month, point.revenue, point.target, point.leads, point.converted]),
        [],
        ['Closed deal', 'Company', 'Closed on', 'Outcome', 'Value'],
        ...outcomes.closed.map((deal) => [deal.title, deal.company, deal.expectedClose, deal.won ? 'Won' : 'Lost', deal.value]),
        [],
        ['Task priority', 'Completed', 'Open'],
        ...tasks.byPriority.map((item) => [item.label, item.completed, item.open]),
        [],
        ['Lead source', 'Leads', 'Won'],
        ...sources.map((item) => [item.source, item.leads, item.won]),
      ]
      downloadCsv(`nexrel-report-${range}m.csv`, rows)
      dispatch(pushToast({ tone: 'success', title: 'Report exported', message: `Your ${range}-month report was downloaded as CSV.` }))
    } catch {
      dispatch(pushToast({ tone: 'error', title: 'Export failed', message: 'The report could not be generated. Try again.' }))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">
            Personal report for <span className="font-semibold text-ink">{user?.name}</span> · last {range} months
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <RangeToggle options={RANGES} value={range} onChange={setRange} label="Report range" />
          <Button variant="outline" onClick={handleExport} loading={exporting}>
            {exporting ? null : <Download className="size-4" aria-hidden />}
            Export CSV
          </Button>
        </div>
      </section>

      <section className="stagger grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Report summary">
        <StatTile icon={CircleDollarSign} label="Won revenue" value={formatCompactCurrency(revenue)} tone="brand" hint={`${attainment}% of ${formatCompactCurrency(target)} target`} />
        <StatTile icon={Percent} label="Lead conversion" value={`${rates.conversion}%`} tone="aurora" hint={`${rates.won} of ${rates.total} leads won`} />
        <StatTile icon={Trophy} label="Completed deals" value={outcomes.wonCount} tone="success" hint={`${outcomes.winRate}% win rate · avg ${formatCompactCurrency(outcomes.avgWon)}`} />
        <StatTile icon={CheckSquare} label="Task completion" value={`${tasks.completionRate}%`} tone="orchid" hint={`${tasks.completed} of ${tasks.total} tasks done`} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <RevenueTargetChart data={months} className="xl:col-span-2" />
        <TargetAttainment data={months} />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ConversionTrendChart data={months} />
        <ConversionFunnel />
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
        <TaskStatsChart />
        <LeadSourcesChart />
        <ActivityMixChart className="lg:col-span-2 2xl:col-span-1" />
      </section>

      <ClosedDealsTable />
    </div>
  )
}
