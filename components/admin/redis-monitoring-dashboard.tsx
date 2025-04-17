"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ChartContainer } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Key,
  MemoryStickIcon as Memory,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types for Redis metrics
interface RedisStats {
  status: "ok" | "error"
  message: string
  responseTime: string
  memoryUsage?: {
    used: number
    peak: number
    total: number
    fragmentationRatio: number
  }
  keyStats?: {
    total: number
    expiringCount: number
    avgTtl: number
  }
  commandStats?: {
    totalCommands: number
    commandsPerSecond: number
    topCommands: {
      name: string
      count: number
      percent: number
    }[]
  }
  clientStats?: {
    connected: number
    blocked: number
    maxClients: number
  }
  errorRate?: number
  uptime?: number
  timestamp: number
}

interface HistoricalData {
  timestamp: number
  responseTime: number
  memoryUsed: number
  keyCount: number
  commandsPerSecond: number
  errorRate: number
}

export function RedisMonitoringDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [redisStats, setRedisStats] = useState<RedisStats | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(30) // seconds
  const { toast } = useToast()

  // Fetch Redis stats
  const fetchRedisStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/redis/stats")

      if (!response.ok) {
        throw new Error(`Failed to fetch Redis stats: ${response.status}`)
      }

      const data = await response.json()
      setRedisStats(data)

      // Add to historical data (limit to last 20 points)
      setHistoricalData((prev) => {
        const newData: HistoricalData = {
          timestamp: Date.now(),
          responseTime: Number.parseInt(data.responseTime.replace("ms", "")),
          memoryUsed: data.memoryUsage?.used || 0,
          keyCount: data.keyStats?.total || 0,
          commandsPerSecond: data.commandStats?.commandsPerSecond || 0,
          errorRate: data.errorRate || 0,
        }

        const updated = [...prev, newData].slice(-20)
        return updated
      })
    } catch (error) {
      console.error("Error fetching Redis stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch Redis metrics",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchRedisStats()
  }, [])

  // Auto-refresh
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (autoRefresh) {
      intervalId = setInterval(() => {
        fetchRedisStats()
      }, refreshInterval * 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [autoRefresh, refreshInterval])

  // Format bytes to human-readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Format seconds to human-readable format
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  // Generate colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>Redis Monitoring Dashboard</CardTitle>
            <CardDescription>Real-time metrics and performance monitoring for Redis</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Auto-refresh:</span>
              <select
                className="text-sm border rounded p-1"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh}
              >
                <option value="10">10s</option>
                <option value="30">30s</option>
                <option value="60">1m</option>
                <option value="300">5m</option>
              </select>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "On" : "Off"}
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={fetchRedisStats} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {redisStats && (
          <div className="mt-2">
            <Alert variant={redisStats.status === "ok" ? "default" : "destructive"}>
              {redisStats.status === "ok" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>Redis Status: {redisStats.status === "ok" ? "Connected" : "Error"}</AlertTitle>
              <AlertDescription className="flex justify-between">
                <span>{redisStats.message}</span>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date(redisStats.timestamp).toLocaleTimeString()}
                </span>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="keys">Keys</TabsTrigger>
            <TabsTrigger value="commands">Commands</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {isLoading && !redisStats ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !redisStats ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to fetch Redis metrics. Please try again.</AlertDescription>
            </Alert>
          ) : (
            <>
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Response Time Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        Response Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{redisStats.responseTime}</div>
                      <p className="text-xs text-muted-foreground mt-1">Time to complete PING command</p>
                    </CardContent>
                  </Card>

                  {/* Memory Usage Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Memory className="mr-2 h-4 w-4 text-muted-foreground" />
                        Memory Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {redisStats.memoryUsage ? formatBytes(redisStats.memoryUsage.used) : "N/A"}
                      </div>
                      {redisStats.memoryUsage && (
                        <>
                          <Progress
                            value={(redisStats.memoryUsage.used / redisStats.memoryUsage.total) * 100}
                            className="h-2 mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {((redisStats.memoryUsage.used / redisStats.memoryUsage.total) * 100).toFixed(1)}% of{" "}
                            {formatBytes(redisStats.memoryUsage.total)}
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Key Stats Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                        Keys
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {redisStats.keyStats ? redisStats.keyStats.total.toLocaleString() : "N/A"}
                      </div>
                      {redisStats.keyStats && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {redisStats.keyStats.expiringCount.toLocaleString()} keys with expiration
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Commands Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center">
                        <Zap className="mr-2 h-4 w-4 text-muted-foreground" />
                        Commands
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {redisStats.commandStats ? redisStats.commandStats.commandsPerSecond.toFixed(2) + "/s" : "N/A"}
                      </div>
                      {redisStats.commandStats && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {redisStats.commandStats.totalCommands.toLocaleString()} total commands
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Response Time Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Response Time Trend</CardTitle>
                      <CardDescription>Redis response time over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ChartContainer
                          config={{
                            responseTime: {
                              label: "Response Time (ms)",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={historicalData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="timestamp"
                                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                              />
                              <YAxis />
                              <Tooltip
                                formatter={(value) => [`${value} ms`, "Response Time"]}
                                labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString()}
                              />
                              <Line
                                type="monotone"
                                dataKey="responseTime"
                                stroke="var(--color-responseTime)"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                                isAnimationActive={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Command Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Command Distribution</CardTitle>
                      <CardDescription>Most frequently used Redis commands</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {redisStats.commandStats && redisStats.commandStats.topCommands ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={redisStats.commandStats.topCommands}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {redisStats.commandStats.topCommands.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip
                                formatter={(value, name, props) => [
                                  `${value} (${(props.payload.percent * 100).toFixed(1)}%)`,
                                  props.payload.name,
                                ]}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-64 text-muted-foreground">
                          No command data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="memory">
                {redisStats.memoryUsage ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Used Memory</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatBytes(redisStats.memoryUsage.used)}</div>
                          <p className="text-xs text-muted-foreground mt-1">Current memory usage</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Peak Memory</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{formatBytes(redisStats.memoryUsage.peak)}</div>
                          <p className="text-xs text-muted-foreground mt-1">Peak memory usage</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Fragmentation Ratio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {redisStats.memoryUsage.fragmentationRatio.toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {redisStats.memoryUsage.fragmentationRatio > 1.5
                              ? "High fragmentation (> 1.5)"
                              : "Normal fragmentation"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Memory Usage Trend</CardTitle>
                        <CardDescription>Redis memory usage over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ChartContainer
                            config={{
                              memoryUsed: {
                                label: "Memory Used",
                                color: "hsl(var(--chart-2))",
                              },
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="timestamp"
                                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                />
                                <YAxis tickFormatter={(value) => formatBytes(value)} />
                                <Tooltip
                                  formatter={(value) => [formatBytes(Number(value)), "Memory Used"]}
                                  labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString()}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="memoryUsed"
                                  stroke="var(--color-memoryUsed)"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Memory Management Tips</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                          <li>Consider enabling Redis key eviction policies if memory usage is high</li>
                          <li>Set appropriate TTLs for cache keys to automatically free memory</li>
                          <li>High fragmentation ratio (>1.5) may indicate memory fragmentation issues</li>
                          <li>Monitor memory usage regularly and adjust your Redis configuration as needed</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    No memory data available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="keys">
                {redisStats.keyStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{redisStats.keyStats.total.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground mt-1">Total number of keys in Redis</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Expiring Keys</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{redisStats.keyStats.expiringCount.toLocaleString()}</div>
                          <p className="text-xs text-muted-foreground mt-1">Keys with an expiration time set</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Average TTL</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {redisStats.keyStats.avgTtl > 0
                              ? `${Math.round(redisStats.keyStats.avgTtl / 1000)} sec`
                              : "N/A"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Average time-to-live for expiring keys</p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Count Trend</CardTitle>
                        <CardDescription>Number of keys over time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ChartContainer
                            config={{
                              keyCount: {
                                label: "Key Count",
                                color: "hsl(var(--chart-3))",
                              },
                            }}
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={historicalData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                  dataKey="timestamp"
                                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                />
                                <YAxis />
                                <Tooltip
                                  formatter={(value) => [value, "Key Count"]}
                                  labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString()}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="keyCount"
                                  stroke="var(--color-keyCount)"
                                  strokeWidth={2}
                                  dot={{ r: 4 }}
                                  activeDot={{ r: 6 }}
                                  isAnimationActive={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </CardContent>
                    </Card>

                    <Alert>
                      <Key className="h-4 w-4" />
                      <AlertTitle>Key Management Tips</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                          <li>
                            Use descriptive key naming patterns with colons as separators (e.g.,{" "}
                            <code>user:1000:profile</code>)
                          </li>
                          <li>Set appropriate TTLs for cache keys to prevent stale data</li>
                          <li>Consider using key prefixes for different data types or services</li>
                          <li>Avoid very long keys as they consume more memory</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    No key statistics available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="commands">
                {redisStats.commandStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Commands Per Second</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {redisStats.commandStats.commandsPerSecond.toFixed(2)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Current command throughput</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Commands</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {redisStats.commandStats.totalCommands.toLocaleString()}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Total commands processed</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {redisStats.errorRate !== undefined ? `${(redisStats.errorRate * 100).toFixed(4)}%` : "N/A"}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Percentage of commands resulting in errors
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Commands Per Second Trend</CardTitle>
                          <CardDescription>Command throughput over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ChartContainer
                              config={{
                                commandsPerSecond: {
                                  label: "Commands/sec",
                                  color: "hsl(var(--chart-4))",
                                },
                              }}
                            >
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={historicalData}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis
                                    dataKey="timestamp"
                                    tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                                  />
                                  <YAxis />
                                  <Tooltip
                                    formatter={(value) => [`${value} cmd/s`, "Commands Per Second"]}
                                    labelFormatter={(timestamp) => new Date(Number(timestamp)).toLocaleTimeString()}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="commandsPerSecond"
                                    stroke="var(--color-commandsPerSecond)"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                    isAnimationActive={false}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </ChartContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Top Commands</CardTitle>
                          <CardDescription>Most frequently used Redis commands</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {redisStats.commandStats.topCommands && redisStats.commandStats.topCommands.length > 0 ? (
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={redisStats.commandStats.topCommands}
                                  layout="vertical"
                                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis type="number" />
                                  <YAxis dataKey="name" type="category" width={80} />
                                  <Tooltip
                                    formatter={(value) => [
                                      `${value} (${((value / redisStats.commandStats.totalCommands) * 100).toFixed(2)}%)`,
                                      "Count",
                                    ]}
                                  />
                                  <Bar dataKey="count" fill="#8884d8" barSize={20}>
                                    {redisStats.commandStats.topCommands.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="flex justify-center items-center h-64 text-muted-foreground">
                              No command data available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertTitle>Command Optimization Tips</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                          <li>Use pipelining to reduce network round trips for multiple commands</li>
                          <li>Consider using batch operations (MGET, MSET) instead of multiple single operations</li>
                          <li>
                            Be cautious with commands that have O(N) complexity on large datasets (KEYS, SMEMBERS)
                          </li>
                          <li>Monitor command latency and optimize frequently used commands</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    No command statistics available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="clients">
                {redisStats.clientStats ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Connected Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{redisStats.clientStats.connected}</div>
                          <p className="text-xs text-muted-foreground mt-1">Currently connected clients</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Blocked Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{redisStats.clientStats.blocked}</div>
                          <p className="text-xs text-muted-foreground mt-1">Clients blocked in list operations</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Max Clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{redisStats.clientStats.maxClients}</div>
                          <p className="text-xs text-muted-foreground mt-1">Maximum client connections</p>
                          <Progress
                            value={(redisStats.clientStats.connected / redisStats.clientStats.maxClients) * 100}
                            className="h-2 mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {((redisStats.clientStats.connected / redisStats.clientStats.maxClients) * 100).toFixed(1)}%
                            of capacity
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert
                      variant={
                        redisStats.clientStats.connected > redisStats.clientStats.maxClients * 0.8
                          ? "warning"
                          : "default"
                      }
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Client Connection Status</AlertTitle>
                      <AlertDescription>
                        {redisStats.clientStats.connected > redisStats.clientStats.maxClients * 0.8 ? (
                          <p className="text-sm">
                            Client connections are approaching the maximum limit. Consider increasing the{" "}
                            <code>maxclients</code> setting or optimizing your connection pooling.
                          </p>
                        ) : (
                          <p className="text-sm">
                            Client connections are within normal range. Current usage:{" "}
                            {((redisStats.clientStats.connected / redisStats.clientStats.maxClients) * 100).toFixed(1)}%
                            of capacity.
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Client Connection Tips</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                          <li>Use connection pooling to efficiently manage Redis connections</li>
                          <li>Set appropriate connection timeouts to prevent resource leaks</li>
                          <li>Monitor blocked clients as they may indicate performance issues</li>
                          <li>
                            Consider increasing <code>maxclients</code> if you consistently have many connections
                          </li>
                          <li>Close unused connections to free up resources</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 text-muted-foreground">
                    No client statistics available
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Historical Metrics</CardTitle>
                    <CardDescription>Performance metrics over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historicalData.length > 0 ? (
                      <div className="space-y-6">
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2">Time</th>
                                <th className="text-right p-2">Response Time</th>
                                <th className="text-right p-2">Memory Used</th>
                                <th className="text-right p-2">Keys</th>
                                <th className="text-right p-2">Commands/sec</th>
                                <th className="text-right p-2">Error Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {historicalData
                                .slice()
                                .reverse()
                                .map((data, index) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="p-2 text-sm">{new Date(data.timestamp).toLocaleTimeString()}</td>
                                    <td className="p-2 text-right text-sm">{data.responseTime} ms</td>
                                    <td className="p-2 text-right text-sm">{formatBytes(data.memoryUsed)}</td>
                                    <td className="p-2 text-right text-sm">{data.keyCount.toLocaleString()}</td>
                                    <td className="p-2 text-right text-sm">{data.commandsPerSecond.toFixed(2)}</td>
                                    <td className="p-2 text-right text-sm">{(data.errorRate * 100).toFixed(4)}%</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground">
                            Showing last {historicalData.length} data points
                          </p>
                          <Button variant="outline" size="sm" onClick={() => setHistoricalData([])}>
                            Clear History
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center items-center h-64 text-muted-foreground">
                        No historical data available yet. Data will appear as metrics are collected.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {redisStats?.uptime ? (
            <span>Redis uptime: {formatUptime(redisStats.uptime)}</span>
          ) : (
            <span>Redis monitoring dashboard</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchRedisStats}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Metrics
        </Button>
      </CardFooter>
    </Card>
  )
}
