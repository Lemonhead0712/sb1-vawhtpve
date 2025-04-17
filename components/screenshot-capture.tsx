"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Download, RefreshCw } from "lucide-react"
import { analyzeScreenshot } from "@/lib/emotional-analysis"
import type { EmotionalAnalysisResult } from "@/lib/emotional-analysis"

export default function ScreenshotCapture() {
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<EmotionalAnalysisResult | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCapture = async () => {
    setIsCapturing(true)
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }
    } catch (err) {
      console.error("Error capturing screen:", err)
      setIsCapturing(false)
    }
  }

  const captureScreenshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL("image/png")
      setScreenshot(dataUrl)

      // Stop all video tracks
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())

      video.srcObject = null
      setIsCapturing(false)

      // Analyze the screenshot
      analyzeScreenshotEmotion(dataUrl)
    }
  }

  const analyzeScreenshotEmotion = async (imageData: string) => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeScreenshot(imageData)
      setAnalysisResult(result)
    } catch (err) {
      console.error("Error analyzing screenshot:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const downloadScreenshot = () => {
    if (!screenshot) return

    const a = document.createElement("a")
    a.href = screenshot
    a.download = `screenshot-${new Date().toISOString()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const resetCapture = () => {
    setScreenshot(null)
    setAnalysisResult(null)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCapturing(false)
  }

  const formatEmotionScore = (score: number) => {
    return (score * 100).toFixed(1) + "%"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Screen Capture & Emotion Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCapturing ? (
          <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-contain" muted />
            <Button className="absolute bottom-4 left-1/2 transform -translate-x-1/2" onClick={captureScreenshot}>
              <Camera className="mr-2 h-4 w-4" />
              Capture Screenshot
            </Button>
          </div>
        ) : screenshot ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              <img
                src={screenshot || "/placeholder.svg"}
                alt="Captured screenshot"
                className="w-full h-full object-contain"
              />
            </div>

            {analysisResult && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="font-medium mb-2">Emotion Analysis Results</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Dominant Emotion</p>
                    <p className="font-medium capitalize">{analysisResult.dominantEmotion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="font-medium">{(analysisResult.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>

                <h4 className="font-medium mt-4 mb-2">Emotion Breakdown</h4>
                <div className="space-y-2">
                  {Object.entries(analysisResult.overallScore).map(([emotion, score]) => (
                    <div key={emotion} className="flex items-center">
                      <span className="w-20 text-sm capitalize">{emotion}</span>
                      <div className="flex-grow h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            emotion === "joy"
                              ? "bg-green-500"
                              : emotion === "sadness"
                                ? "bg-blue-500"
                                : emotion === "anger"
                                  ? "bg-red-500"
                                  : emotion === "fear"
                                    ? "bg-purple-500"
                                    : "bg-amber-500"
                          }`}
                          style={{ width: `${score * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm">{formatEmotionScore(score)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-md">
            <p className="text-muted-foreground mb-4">No screenshot captured</p>
            <Button onClick={startCapture}>
              <Camera className="mr-2 h-4 w-4" />
              Start Screen Capture
            </Button>
          </div>
        )}
      </CardContent>
      {screenshot && (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={resetCapture}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Capture
          </Button>
          <Button variant="secondary" onClick={downloadScreenshot}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      )}

      {/* Hidden canvas for capturing screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  )
}
