'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { courseApi } from '@/services/course-api'
import { feedbackApi } from '@/services/feedback-api'
import { paymentApi } from '@/services/payment-api'
import { userApi } from '@/services/user-api'
import { ArcElement, BarElement, CategoryScale, Chart, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar, Line } from 'react-chartjs-2'

Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend)

// Horizontal Bar Chart: Top 5 Courses by Revenue
function TopCoursesBarChart() {
  const [chartData, setChartData] = useState({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      setLoading(true)
      try {
        const res = await paymentApi.getTopCoursesByRevenue()
        if (isMounted) setChartData(res)
      } catch (e) {
        setChartData({ labels: [], data: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Revenue (USD)',
        data: chartData.data,
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  }
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            return '$' + tickValue;
          },
        },
      },
    },
  }
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Top 5 Courses by Revenue</h2>
      <div style={{ height: 220 }}>
        {loading ? <div className="text-center">Loading...</div> : <Bar data={data} options={options} />}
      </div>
    </div>
  )
}

// Biểu đồ đường: Thu nhập theo tháng
function IncomeLineChart() {
  const [chartData, setChartData] = useState({ labels: [], data: [] })
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let isMounted = true
    async function fetchData() {
      setLoading(true)
      try {
        const res = await paymentApi.getRevenueByMonth()
        if (isMounted) setChartData(res)
      } catch (e) {
        setChartData({ labels: [], data: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])
  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Income (USD)',
        data: chartData.data,
        borderColor: 'rgba(251, 191, 36, 1)',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(251, 191, 36, 1)',
      },
    ],
  }
  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(tickValue: string | number) {
            return '$' + tickValue;
          },
        },
      },
    },
  }
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Income by Month</h2>
      <div style={{ height: 180 }}>
        {loading ? <div className="text-center">Loading...</div> : <Line data={data} options={options} />}
      </div>
    </div>
  )
}

// Bảng đơn hàng gần đây
function RecentOrdersTable() {
  const orders = [
    { id: 'ORD001', user: 'John Smith', amount: '$120', status: 'Success', date: '2024-07-20' },
    { id: 'ORD002', user: 'Jane Doe', amount: '$90', status: 'Failed', date: '2024-07-19' },
    { id: 'ORD003', user: 'Michael Lee', amount: '$200', status: 'Success', date: '2024-07-18' },
    { id: 'ORD004', user: 'Emily Clark', amount: '$150', status: 'Processing', date: '2024-07-17' },
  ]
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Order ID</th>
            <th className="py-2 px-4 text-left">Customer</th>
            <th className="py-2 px-4 text-left">Amount</th>
            <th className="py-2 px-4 text-left">Status</th>
            <th className="py-2 px-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="py-2 px-4">{order.id}</td>
              <td className="py-2 px-4">{order.user}</td>
              <td className="py-2 px-4">{order.amount}</td>
              <td className="py-2 px-4">
                <span className={
                  order.status === 'Success'
                    ? 'text-green-600'
                    : order.status === 'Failed'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }>
                  {order.status}
                </span>
              </td>
              <td className="py-2 px-4">{order.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Stat Cards Section
function StatCards() {
  const [stats, setStats] = useState([
    { label: 'Total Users', value: '...', icon: '👤', color: 'bg-blue-100 text-blue-700' },
    { label: 'Total Courses', value: '...', icon: '📚', color: 'bg-green-100 text-green-700' },
    { label: 'Total Revenue', value: '...', icon: '💰', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Pending Reviews', value: '...', icon: '📝', color: 'bg-red-100 text-red-700' },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function fetchStats() {
      setLoading(true)
      try {
        const [userCount, courseCount, totalRevenue, feedbackRes] = await Promise.all([
          userApi.getUserCount(),
          courseApi.getCourseCount(),
          paymentApi.getTotalRevenue(),
          feedbackApi.countAllFeedbacks(),
        ])
        console.log('feedbackRes', feedbackRes);
        console.log('feedbackRes.data', feedbackRes.data);
        console.log('feedbackRes.data?.data', feedbackRes.data?.data);
        if (!isMounted) return
        setStats([
          { label: 'Total Users', value: userCount ?? 0, icon: '👤', color: 'bg-blue-100 text-blue-700' },
          { label: 'Total Courses', value: courseCount ?? 0, icon: '📚', color: 'bg-green-100 text-green-700' },
          { label: 'Total Revenue', value: `$${totalRevenue?.toLocaleString() ?? 0}`, icon: '💰', color: 'bg-yellow-100 text-yellow-700' },
          { label: 'Total Feedback', value: feedbackRes.data, icon: '📝', color: 'bg-red-100 text-red-700' },
        ])
      } catch (e) {
        // fallback: giữ nguyên giá trị cũ
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
    return () => { isMounted = false }
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className={`flex items-center gap-3 rounded-lg p-4 shadow-sm ${stat.color} font-semibold`}>
          <span className="text-2xl">{stat.icon}</span>
          <div>
            <div className="text-lg">{loading ? <span className="animate-pulse">...</span> : stat.value}</div>
            <div className="text-xs font-normal text-gray-500">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']} requireAuth={true}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-6 p-8 pt-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <StatCards />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <IncomeLineChart />
              <TopCoursesBarChart />
            </div>
            <RecentOrdersTable />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
