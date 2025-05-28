"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  Shield,
  Eye,
  Lock,
  Users,
  Activity,
  Globe,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  Key,
  Database,
} from "lucide-react"

// Mock security data
const securityAlerts = [
  {
    id: "SEC-001",
    type: "suspicious_login",
    severity: "high",
    title: "Multiple Failed Login Attempts",
    description: "User attempted to login 15 times from IP 192.168.1.100",
    timestamp: "2024-01-20T14:30:00Z",
    status: "active",
    userId: "user-123",
    ipAddress: "192.168.1.100",
    location: "Unknown",
  },
  {
    id: "SEC-002",
    type: "unusual_activity",
    severity: "medium",
    title: "Unusual Download Pattern",
    description: "User downloaded 50+ course materials in 10 minutes",
    timestamp: "2024-01-20T13:15:00Z",
    status: "investigating",
    userId: "user-456",
    ipAddress: "203.0.113.45",
    location: "New York, US",
  },
  {
    id: "SEC-003",
    type: "data_breach_attempt",
    severity: "critical",
    title: "SQL Injection Attempt",
    description: "Malicious SQL query detected in search parameter",
    timestamp: "2024-01-20T12:45:00Z",
    status: "blocked",
    ipAddress: "198.51.100.78",
    location: "Unknown",
  },
]

const auditLogs = [
  {
    id: "AUDIT-001",
    action: "user_created",
    actor: "admin@example.com",
    target: "john.doe@example.com",
    timestamp: "2024-01-20T15:30:00Z",
    details: "Created new user account with learner role",
    ipAddress: "192.168.1.50",
  },
  {
    id: "AUDIT-002",
    action: "course_deleted",
    actor: "manager@example.com",
    target: "Advanced React Course",
    timestamp: "2024-01-20T14:20:00Z",
    details: "Permanently deleted course and all associated content",
    ipAddress: "192.168.1.75",
  },
  {
    id: "AUDIT-003",
    action: "settings_modified",
    actor: "admin@example.com",
    target: "System Settings",
    timestamp: "2024-01-20T13:10:00Z",
    details: "Modified email configuration settings",
    ipAddress: "192.168.1.50",
  },
]

const loginAttempts = [
  {
    id: "LOGIN-001",
    email: "john@example.com",
    status: "success",
    ipAddress: "192.168.1.25",
    location: "San Francisco, US",
    timestamp: "2024-01-20T15:45:00Z",
    userAgent: "Chrome 120.0.0.0",
  },
  {
    id: "LOGIN-002",
    email: "hacker@malicious.com",
    status: "failed",
    ipAddress: "192.168.1.100",
    location: "Unknown",
    timestamp: "2024-01-20T14:30:00Z",
    userAgent: "curl/7.68.0",
    reason: "Invalid credentials",
  },
  {
    id: "LOGIN-003",
    email: "jane@example.com",
    status: "success",
    ipAddress: "203.0.113.45",
    location: "New York, US",
    timestamp: "2024-01-20T13:20:00Z",
    userAgent: "Firefox 121.0",
  },
]

const severityConfig = {
  critical: { label: "Critical", variant: "destructive" as const, icon: XCircle },
  high: { label: "High", variant: "destructive" as const, icon: AlertTriangle },
  medium: { label: "Medium", variant: "secondary" as const, icon: AlertCircle },
  low: { label: "Low", variant: "outline" as const, icon: CheckCircle },
}

const statusConfig = {
  active: { label: "Active", variant: "destructive" as const },
  investigating: { label: "Investigating", variant: "secondary" as const },
  resolved: { label: "Resolved", variant: "default" as const },
  blocked: { label: "Blocked", variant: "outline" as const },
}

export function SecurityMonitoring() {
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const getSecurityStats = () => {
    const totalAlerts = securityAlerts.length
    const criticalAlerts = securityAlerts.filter((a) => a.severity === "critical").length
    const activeAlerts = securityAlerts.filter((a) => a.status === "active").length
    const blockedAttempts = loginAttempts.filter((l) => l.status === "failed").length

    return { totalAlerts, criticalAlerts, activeAlerts, blockedAttempts }
  }

  const stats = getSecurityStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Monitoring</h1>
        <p className="text-muted-foreground mt-2">Monitor security threats, audit logs, and system access patterns.</p>
      </div>

      {/* Security Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <div className="text-xs text-muted-foreground">
              {stats.criticalAlerts} critical, {stats.activeAlerts} active
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedAttempts}</div>
            <div className="text-xs text-muted-foreground">Last 24 hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Secure</div>
            <Progress value={95} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-xs text-muted-foreground">Currently online</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Monitor and respond to security threats</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityAlerts.map((alert) => {
                    const severityInfo = severityConfig[alert.severity as keyof typeof severityConfig]
                    const statusInfo = statusConfig[alert.status as keyof typeof statusConfig]
                    const SeverityIcon = severityInfo?.icon

                    return (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{alert.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={severityInfo?.variant} className="flex items-center gap-1 w-fit">
                            {SeverityIcon && <SeverityIcon className="h-3 w-3" />}
                            {severityInfo?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{alert.description}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo?.variant}>{statusInfo?.label}</Badge>
                        </TableCell>
                        <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>Track all administrative actions and system changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.action.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.actor}</TableCell>
                      <TableCell>{log.target}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
              <CardDescription>Monitor login attempts and user access patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>User Agent</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginAttempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{attempt.email}</TableCell>
                      <TableCell>
                        <Badge variant={attempt.status === "success" ? "default" : "destructive"}>
                          {attempt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{attempt.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          {attempt.location}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{attempt.userAgent}</TableCell>
                      <TableCell>{new Date(attempt.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>Current security settings and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>Password Policy</span>
                  </div>
                  <Badge variant="default">Strong</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Session Timeout</span>
                  </div>
                  <Badge variant="default">30 minutes</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4" />
                    <span>Data Encryption</span>
                  </div>
                  <Badge variant="default">AES-256</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Rate Limiting</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Threat Detection</CardTitle>
                <CardDescription>Automated security monitoring status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Brute Force Protection</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>SQL Injection Detection</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>XSS Protection</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>DDoS Mitigation</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Malware Scanning</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
