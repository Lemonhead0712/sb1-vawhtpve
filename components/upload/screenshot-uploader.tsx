"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, AlertCircle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { analyzeScreenshots } from "@/lib/screenshot-analysis/service"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { NameCollectionForm } from "./name-collection-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const MAX_FILES = 10
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

interface ScreenshotUploaderProps {
  onAnalysisComplete?: (results: any) => void
  initialNames?: { userA: string; userB: string }
}

export function ScreenshotUploader({ onAnalysisComplete, initialNames }: ScreenshotUploaderProps) {
  const [step, setStep] = useState<"names" | "upload">(initialNames ? "upload" : "names")
  const [names, setNames] = useState<{ userA: string; userB: string } | null>(initialNames || null)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [processingStatus, setProcessingStatus] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleNamesSubmitted = (submittedNames: { userA: string; userB: string }) => {
    setNames(submittedNames)
    setStep("upload")
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFiles = (filesToValidate: File[]): { valid: File[]; errors: string[] } => {
    const validFiles: File[] = []
    const newErrors: string[] = []

    // Check if adding these files would exceed the limit
    if (files.length + filesToValidate.length > MAX_FILES) {
      newErrors.push(`You can upload a maximum of ${MAX_FILES} screenshots.`)
      // Only process files up to the limit
      filesToValidate = filesToValidate.slice(0, MAX_FILES - files.length)
    }

    filesToValidate.forEach((file) => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors.push(`"${file.name}" is not a supported image format.`)
        return
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`"${file.name}" exceeds the 5MB size limit.`)
        return
      }

      validFiles.push(file)
    })

    return { valid: validFiles, errors: newErrors }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      addFiles(droppedFiles)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      addFiles(selectedFiles)
    }
  }

  const addFiles = (newFiles: File[]) => {
    const { valid, errors: newErrors } = validateFiles(newFiles)

    if (valid.length > 0) {
      // Create object URLs for previews
      const newPreviews = valid.map((file) => URL.createObjectURL(file))

      setFiles((prevFiles) => [...prevFiles, ...valid])
      setPreviews((prevPreviews) => [...prevPreviews, ...newPreviews])
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
    }
  }

  const removeFile = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index])

    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
    setPreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index))
  }

  const clearErrors = () => {
    setErrors([])
  }

  const clearWarnings = () => {
    setWarnings([])
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setErrors(["Please select at least one screenshot to upload."])
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setProcessingStatus("Initializing analysis...")
    setWarnings([])

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 2

          // Update status messages based on progress
          if (newProgress > 25 && newProgress < 30) {
            setProcessingStatus("Processing OCR with available services...")
          } else if (newProgress > 50 && newProgress < 55) {
            setProcessingStatus("Analyzing emotional patterns...")
          } else if (newProgress > 75 && newProgress < 80) {
            setProcessingStatus("Generating insights...")
          }

          return newProgress >= 100 ? 100 : newProgress
        })
      }, 200)

      // Process the screenshots with our enhanced analysis service
      const results = await analyzeScreenshots(files, names || undefined)

      clearInterval(progressInterval)
      setUploadProgress(100)
      setProcessingStatus("Analysis complete!")

      // Check if any fallbacks were used
      if (results.screenshots.some((s: any) => s.messages.length === 0)) {
        setWarnings(["Some screenshots couldn't be fully processed. Limited analysis provided for those images."])
      }

      // Store results in localStorage for demo purposes
      // In a real app, this would be stored in a database
      localStorage.setItem("analysisResults", JSON.stringify(results))
      localStorage.setItem("analysisTimestamp", new Date().toISOString())

      // Notify parent component about the completed analysis
      if (typeof onAnalysisComplete === "function") {
        onAnalysisComplete(results)
      }

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${files.length} screenshots with enhanced OCR and emotional detection.`,
        variant: "default",
      })

      // Redirect to analysis page after a short delay
      setTimeout(() => {
        router.push("/analysis")
      }, 1000)
    } catch (error) {
      console.error("Error analyzing screenshots:", error)
      setErrors(["An error occurred while analyzing the screenshots. Using fallback analysis."])

      // Even on error, we proceed with fallback data
      setProcessingStatus("Using fallback analysis...")
      setUploadProgress(100)

      setTimeout(() => {
        router.push("/analysis")
      }, 2000)
    } finally {
      setIsUploading(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (step === "names") {
    return <NameCollectionForm onNamesSubmitted={handleNamesSubmitted} isOptional={false} />
  }

  return (
    <div className="w-full space-y-4">
      {/* Names display */}
      {names && (
        <div className="bg-lavender/20 p-4 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="font-medium">Analyzing conversation between:</h3>
            <p className="text-sm">
              <span className="font-medium">{names.userA}</span> (right side) and{" "}
              <span className="font-medium">{names.userB}</span> (left side)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setStep("names")}>
            Change Names
          </Button>
        </div>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="mt-2 h-auto" onClick={clearErrors}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Warning messages */}
      {warnings.length > 0 && (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
            <Button variant="ghost" size="sm" className="mt-2 h-auto" onClick={clearWarnings}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Drag and drop area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-gray-200",
          files.length > 0 && "border-gray-200 bg-gray-50",
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleChange}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-white rounded-full p-4 shadow-sm">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-1">
              {files.length > 0
                ? `${files.length} file${files.length !== 1 ? "s" : ""} selected`
                : "Upload Screenshots"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your screenshots, or{" "}
              <button type="button" className="text-primary hover:underline" onClick={openFileDialog}>
                browse
              </button>
            </p>
            <p className="text-xs text-muted-foreground">Supports JPG, JPEG, PNG, WebP • Max 10 files • 5MB per file</p>
          </div>
        </div>
      </div>

      {/* Preview grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="overflow-hidden group relative">
              <div className="aspect-square relative">
                <Image
                  src={preview || "/placeholder.svg"}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
              <CardContent className="p-2">
                <p className="text-xs truncate">{files[index].name}</p>
                <p className="text-xs text-muted-foreground">{(files[index].size / 1024 / 1024).toFixed(2)} MB</p>
              </CardContent>
            </Card>
          ))}

          {/* Add more button */}
          {files.length < MAX_FILES && (
            <Card
              className="border-dashed border-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={openFileDialog}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Add More</p>
                <p className="text-xs text-muted-foreground">{MAX_FILES - files.length} remaining</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Upload button and progress */}
      {files.length > 0 && (
        <div className="space-y-4">
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{processingStatus}</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <Button onClick={handleUpload} className="w-full" size="lg">
              <Upload className="mr-2 h-4 w-4" />
              Analyze {files.length} Screenshot{files.length !== 1 ? "s" : ""}
            </Button>
          )}
        </div>
      )}

      {/* Success message after upload */}
      {uploadProgress === 100 && (
        <Alert variant="success" className="animate-in fade-in">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Analysis Complete!</AlertTitle>
          <AlertDescription>Redirecting you to your analysis results...</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
