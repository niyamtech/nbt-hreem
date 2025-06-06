"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, Timer, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const MOTIVATIONAL_QUOTES = [
  "Focus is the bridge between goals and accomplishment.",
  "The expert in anything was once a beginner.",
  "Progress, not perfection.",
  "Small steps lead to big changes.",
  "Your only limit is your mind.",
  "Success is the sum of small efforts repeated daily.",
  "Focus on being productive instead of busy.",
  "The way to get started is to quit talking and begin doing.",
  "Don't watch the clock; do what it does. Keep going.",
  "Concentration is the secret of strength.",
  "Deep work is the ability to focus without distraction.",
  "Excellence is never an accident.",
  "The future depends on what you do today.",
  "Stay focused and never give up.",
  "Great things never come from comfort zones.",
]

const BREAK_TREATS = [
  { icon: "☕", text: "Grab a coffee or tea", description: "Hydrate and energize yourself" },
  { icon: "🚶", text: "Take a short walk", description: "Get your blood flowing" },
  { icon: "🧘", text: "Do some stretches", description: "Release tension from your body" },
  { icon: "🌱", text: "Water your plants", description: "Connect with nature" },
  { icon: "🎵", text: "Listen to your favorite song", description: "Boost your mood with music" },
  { icon: "📱", text: "Check your messages", description: "Stay connected with friends" },
  { icon: "🍎", text: "Have a healthy snack", description: "Fuel your brain" },
  { icon: "💧", text: "Drink some water", description: "Stay hydrated" },
  { icon: "🪟", text: "Look out the window", description: "Rest your eyes and mind" },
  { icon: "📝", text: "Jot down your thoughts", description: "Clear your mental space" },
  { icon: "🎨", text: "Doodle or sketch", description: "Express your creativity" },
  { icon: "🧠", text: "Do a quick meditation", description: "Center yourself" },
]

const LONG_BREAK_TREATS = [
  { icon: "🍽️", text: "Enjoy a proper meal", description: "Nourish your body well" },
  { icon: "🚿", text: "Take a refreshing shower", description: "Reset and recharge" },
  { icon: "📚", text: "Read a few pages", description: "Feed your mind" },
  { icon: "🏃", text: "Go for a run or workout", description: "Get your energy up" },
  { icon: "☎️", text: "Call a friend or family", description: "Connect with loved ones" },
  { icon: "🧹", text: "Tidy up your space", description: "Clear your environment" },
  { icon: "🎮", text: "Play a quick game", description: "Have some fun" },
  { icon: "🛋️", text: "Take a power nap", description: "Recharge completely" },
  { icon: "🌳", text: "Step outside for fresh air", description: "Connect with nature" },
  { icon: "🎬", text: "Watch a short video", description: "Entertain yourself" },
]

const MODE_MESSAGES = {
  work: ["Working...", "Deep Focus Mode", "In the Zone", "Making Progress", "Crushing Goals"],
  shortBreak: ["Short Break Time", "Quick Recharge", "Mini Reset", "Breathe & Relax"],
  longBreak: ["Long Break Time", "Well Deserved Rest", "Major Recharge", "Reset & Refresh"],
}

type TimerMode = "work" | "shortBreak" | "longBreak"
type TimerState = "running" | "paused" | "completed" | "ready"

interface PomodoroData {
  completedSessions: number
  totalWorkTime: number
  currentStreak: number
  lastSessionDate: string
  cyclePosition: number // 0-3, resets after long break
}

interface TimerPreset {
  name: string
  description: string
  work: number
  shortBreak: number
  longBreak: number
}

interface BreakSettings {
  autoStartBreaks: boolean
  showBreakTreats: boolean
  breakReminders: boolean
}

const TIMER_PRESETS: Record<string, TimerPreset> = {
  classic: {
    name: "Classic",
    description: "Traditional Pomodoro (25/6/35)",
    work: 25 * 60,
    shortBreak: 6 * 60,
    longBreak: 35 * 60,
  },
  extended: {
    name: "Extended",
    description: "Longer focus sessions (30/6/40)",
    work: 30 * 60,
    shortBreak: 6 * 60,
    longBreak: 40 * 60,
  },
  deepFocus: {
    name: "Deep Focus",
    description: "Maximum concentration (37/7/45)",
    work: 37 * 60,
    shortBreak: 7 * 60,
    longBreak: 45 * 60,
  },
  custom: {
    name: "Custom",
    description: "Your personalized settings",
    work: 25 * 60,
    shortBreak: 6 * 60,
    longBreak: 35 * 60,
  },
}

const MODE_LABELS = {
  work: "Focus Time",
  shortBreak: "Short Break",
  longBreak: "Long Break",
}

const MODE_COLORS = {
  work: "bg-red-500",
  shortBreak: "bg-green-500",
  longBreak: "bg-blue-500",
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<TimerMode>("work")
  const [timerState, setTimerState] = useState<TimerState>("ready")
  const [currentPreset, setCurrentPreset] = useState<string>("classic")
  const [customDurations, setCustomDurations] = useState({
    work: 25,
    shortBreak: 6,
    longBreak: 35,
  })
  const [breakSettings, setBreakSettings] = useState<BreakSettings>({
    autoStartBreaks: true,
    showBreakTreats: true,
    breakReminders: true,
  })
  const [showSettings, setShowSettings] = useState(false)
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.classic.work)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroData, setPomodoroData] = useState<PomodoroData>({
    completedSessions: 0,
    totalWorkTime: 0,
    currentStreak: 0,
    lastSessionDate: new Date().toDateString(),
    cyclePosition: 0,
  })

  const [isFullScreen, setIsFullScreen] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [currentMessage, setCurrentMessage] = useState("")
  const [currentTreat, setCurrentTreat] = useState<(typeof BREAK_TREATS)[0] | null>(null)

  // Load data from session storage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem("pomodoroData")
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setPomodoroData(parsed)
    }

    const savedSettings = sessionStorage.getItem("pomodoroSettings")
    if (savedSettings) {
      const {
        currentPreset: savedPreset,
        customDurations: savedCustom,
        breakSettings: savedBreakSettings,
      } = JSON.parse(savedSettings)
      setCurrentPreset(savedPreset)
      setCustomDurations(savedCustom)
      if (savedBreakSettings) setBreakSettings(savedBreakSettings)

      if (savedPreset === "custom") {
        setTimeLeft(savedCustom.work * 60)
      } else {
        setTimeLeft(TIMER_PRESETS[savedPreset].work)
      }
    }
  }, [])

  // Save data to session storage
  useEffect(() => {
    sessionStorage.setItem("pomodoroData", JSON.stringify(pomodoroData))
  }, [pomodoroData])

  useEffect(() => {
    const settings = {
      currentPreset,
      customDurations,
      breakSettings,
    }
    sessionStorage.setItem("pomodoroSettings", JSON.stringify(settings))
  }, [currentPreset, customDurations, breakSettings])

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete()
    }

    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  // Handle full-screen mode and content
  useEffect(() => {
    if (isRunning) {
      setIsFullScreen(true)
      setCurrentQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
      setCurrentMessage(MODE_MESSAGES[mode][Math.floor(Math.random() * MODE_MESSAGES[mode].length)])

      if (mode !== "work" && breakSettings.showBreakTreats) {
        const treats = mode === "longBreak" ? LONG_BREAK_TREATS : BREAK_TREATS
        setCurrentTreat(treats[Math.floor(Math.random() * treats.length)])
      }
    }
  }, [isRunning, mode, breakSettings.showBreakTreats])

  // Update message periodically while running
  useEffect(() => {
    let messageInterval: NodeJS.Timeout

    if (isRunning && isFullScreen) {
      messageInterval = setInterval(() => {
        setCurrentMessage(MODE_MESSAGES[mode][Math.floor(Math.random() * MODE_MESSAGES[mode].length)])

        if (mode !== "work" && breakSettings.showBreakTreats) {
          const treats = mode === "longBreak" ? LONG_BREAK_TREATS : BREAK_TREATS
          setCurrentTreat(treats[Math.floor(Math.random() * treats.length)])
        }
      }, 15000) // Change every 15 seconds during breaks
    }

    return () => clearInterval(messageInterval)
  }, [isRunning, isFullScreen, mode, breakSettings.showBreakTreats])

  const getCurrentDurations = () => {
    if (currentPreset === "custom") {
      return {
        work: customDurations.work * 60,
        shortBreak: customDurations.shortBreak * 60,
        longBreak: customDurations.longBreak * 60,
      }
    }
    return TIMER_PRESETS[currentPreset]
  }

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    setTimerState("completed")

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`${MODE_LABELS[mode]} completed!`, {
        body: mode === "work" ? "Time for a break!" : "Ready to focus?",
        icon: "/favicon.ico",
      })
    }

    if (mode === "work") {
      // Completed a work session
      const today = new Date().toDateString()
      const durations = getCurrentDurations()
      const newCyclePosition = (pomodoroData.cyclePosition + 1) % 4

      setPomodoroData((prev) => ({
        ...prev,
        completedSessions: prev.completedSessions + 1,
        totalWorkTime: prev.totalWorkTime + Math.floor(durations.work / 60),
        currentStreak: prev.lastSessionDate === today ? prev.currentStreak + 1 : 1,
        lastSessionDate: today,
        cyclePosition: newCyclePosition,
      }))

      // Determine next break type
      const nextMode = newCyclePosition === 0 ? "longBreak" : "shortBreak"

      if (breakSettings.autoStartBreaks) {
        // Auto-start break
        setTimeout(() => {
          setMode(nextMode)
          setTimeLeft(durations[nextMode])
          setTimerState("ready")
          startBreak()
        }, 2000)
      } else {
        // Wait for user to start break
        setMode(nextMode)
        setTimeLeft(durations[nextMode])
        setTimerState("ready")
      }
    } else {
      // Completed a break, ready for next work session
      setMode("work")
      const durations = getCurrentDurations()
      setTimeLeft(durations.work)
      setTimerState("ready")
    }
  }, [mode, pomodoroData, breakSettings.autoStartBreaks, currentPreset, customDurations])

  const startBreak = () => {
    setIsRunning(true)
    setTimerState("running")
  }

  const startNextSession = () => {
    setIsRunning(true)
    setTimerState("running")
  }

  const toggleTimer = () => {
    if (!isRunning && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission()
    }

    if (isRunning) {
      setIsFullScreen(false)
      setTimerState("paused")
    } else {
      setTimerState("running")
    }

    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimerState("ready")
    const durations = getCurrentDurations()
    setTimeLeft(durations[mode])
  }

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode)
    const durations = getCurrentDurations()
    setTimeLeft(durations[newMode])
    setIsRunning(false)
    setTimerState("ready")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const durations = getCurrentDurations()
    const total = durations[mode]
    return ((total - timeLeft) / total) * 100
  }

  const resetAllData = () => {
    const initialData = {
      completedSessions: 0,
      totalWorkTime: 0,
      currentStreak: 0,
      lastSessionDate: new Date().toDateString(),
      cyclePosition: 0,
    }
    setPomodoroData(initialData)
    sessionStorage.setItem("pomodoroData", JSON.stringify(initialData))
  }

  const applyPreset = (presetKey: string) => {
    setCurrentPreset(presetKey)
    setIsRunning(false)
    setTimerState("ready")

    if (presetKey !== "custom") {
      const preset = TIMER_PRESETS[presetKey]
      setTimeLeft(preset[mode])
    } else {
      setTimeLeft(customDurations[mode] * 60)
    }
  }

  const updateCustomDuration = (type: keyof typeof customDurations, value: number) => {
    setCustomDurations((prev) => ({
      ...prev,
      [type]: Math.max(1, Math.min(120, value)),
    }))

    if (currentPreset === "custom" && type === mode) {
      setTimeLeft(value * 60)
      setIsRunning(false)
      setTimerState("ready")
    }
  }

  const handleEmergency = () => {
    setIsRunning(false)
    setIsFullScreen(false)
    setTimerState("paused")
  }

  const exitFullScreen = () => {
    setIsFullScreen(false)
  }

  const getCycleProgress = () => {
    return `${pomodoroData.cyclePosition}/4`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Full Screen Timer Mode */}
      {isFullScreen && isRunning && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white ${
            mode === "work"
              ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
              : mode === "shortBreak"
                ? "bg-gradient-to-br from-green-900 via-green-800 to-emerald-900"
                : "bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
          }`}
        >
          {/* Exit Button */}
          <button
            onClick={exitFullScreen}
            className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors text-sm"
          >
            ← Back to Dashboard
          </button>

          {/* Mode Indicator */}
          <div className={`w-4 h-4 rounded-full ${MODE_COLORS[mode]} mb-8 animate-pulse`} />

          {/* Dynamic Message */}
          <div className="text-2xl md:text-4xl font-light text-slate-300 mb-8 animate-fade-in">{currentMessage}</div>

          {/* Giant Timer */}
          <div className="text-8xl md:text-9xl lg:text-[12rem] font-mono font-bold mb-12 tracking-wider">
            {formatTime(timeLeft)}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-2xl mb-12">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${mode === "work" ? "bg-red-500" : mode === "shortBreak" ? "bg-green-500" : "bg-blue-500"} transition-all duration-1000 ease-out`}
                style={{ width: `${getProgress()}%` }}
              />
            </div>
          </div>

          {/* Break Treats */}
          {mode !== "work" && currentTreat && breakSettings.showBreakTreats && (
            <div className="mb-8 text-center max-w-md">
              <div className="text-6xl mb-4">{currentTreat.icon}</div>
              <div className="text-xl font-medium mb-2">{currentTreat.text}</div>
              <div className="text-sm text-slate-400">{currentTreat.description}</div>
            </div>
          )}

          {/* Emergency Button */}
          <div className="flex gap-4 mb-8">
            <Button
              onClick={handleEmergency}
              variant="outline"
              size="lg"
              className="bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30 hover:text-red-200"
            >
              Something Came Up!
            </Button>
            <Button
              onClick={toggleTimer}
              variant="outline"
              size="lg"
              className="bg-slate-700/50 border-slate-500/50 text-slate-300 hover:bg-slate-600/50"
            >
              {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isRunning ? "Pause" : "Resume"}
            </Button>
          </div>

          {/* Motivational Quote */}
          <div className="absolute bottom-8 left-8 right-8 text-center">
            <blockquote className="text-slate-400 italic text-lg max-w-2xl mx-auto">"{currentQuote}"</blockquote>
          </div>

          {/* Session Info */}
          <div className="absolute top-6 left-6 text-slate-500 text-sm">
            Session {pomodoroData.completedSessions + 1} • Cycle {getCycleProgress()} •{" "}
            {TIMER_PRESETS[currentPreset].name}
          </div>
        </div>
      )}

      {/* Break Completion Screen */}
      {timerState === "completed" && mode !== "work" && !isRunning && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-white ${
            mode === "shortBreak"
              ? "bg-gradient-to-br from-green-900 via-green-800 to-emerald-900"
              : "bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
          }`}
        >
          <div className="text-center space-y-8">
            <div className="text-6xl mb-4">{mode === "shortBreak" ? "🌟" : "✨"}</div>
            <div className="text-4xl font-bold">Break Complete!</div>
            <div className="text-xl text-slate-300">Ready to get back to work?</div>

            <div className="flex gap-4">
              <Button
                onClick={startNextSession}
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Next Session
              </Button>
              <Button
                onClick={exitFullScreen}
                variant="outline"
                size="lg"
                className="border-white/50 text-white hover:bg-white/10"
              >
                Back to Dashboard
              </Button>
            </div>

            <div className="text-sm text-slate-400">
              Next: {Math.floor(getCurrentDurations().work / 60)} minute focus session
            </div>
          </div>
        </div>
      )}

      {/* Regular Dashboard View */}
      {!isFullScreen && timerState !== "completed" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-2">
              <Timer className="w-8 h-8" />
              Pomodoro Timer
            </h1>
            <p className="text-slate-600">Stay focused and productive with the Pomodoro Technique</p>
          </div>

          {/* Timer Presets & Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Timer Settings</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {showSettings ? "Hide" : "Settings"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preset Selection */}
              <div className="space-y-2">
                <h3 className="font-medium text-sm text-slate-600">Quick Presets</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(TIMER_PRESETS).map(([key, preset]) => (
                    <Button
                      key={key}
                      variant={currentPreset === key ? "default" : "outline"}
                      onClick={() => applyPreset(key)}
                      disabled={isRunning}
                      className="flex flex-col items-center p-3 h-auto"
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs opacity-70">{preset.description.split(" ")[0]}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="space-y-6 pt-4 border-t">
                  {/* Break Settings */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-slate-600">Break Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={breakSettings.autoStartBreaks}
                          onChange={(e) => setBreakSettings((prev) => ({ ...prev, autoStartBreaks: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm">Auto-start breaks</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={breakSettings.showBreakTreats}
                          onChange={(e) => setBreakSettings((prev) => ({ ...prev, showBreakTreats: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm">Show break treats</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={breakSettings.breakReminders}
                          onChange={(e) => setBreakSettings((prev) => ({ ...prev, breakReminders: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm">Break reminders</span>
                      </label>
                    </div>
                  </div>

                  {/* Custom Durations */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm text-slate-600">Custom Durations (minutes)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Work Session</label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCustomDuration("work", customDurations.work - 1)}
                            disabled={customDurations.work <= 1}
                          >
                            -
                          </Button>
                          <input
                            type="number"
                            value={customDurations.work}
                            onChange={(e) => updateCustomDuration("work", Number.parseInt(e.target.value) || 1)}
                            className="w-16 text-center border rounded px-2 py-1"
                            min="1"
                            max="120"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCustomDuration("work", customDurations.work + 1)}
                            disabled={customDurations.work >= 120}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Short Break</label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCustomDuration("shortBreak", customDurations.shortBreak - 1)}
                            disabled={customDurations.shortBreak <= 1}
                          >
                            -
                          </Button>
                          <input
                            type="number"
                            value={customDurations.shortBreak}
                            onChange={(e) => updateCustomDuration("shortBreak", Number.parseInt(e.target.value) || 1)}
                            className="w-16 text-center border rounded px-2 py-1"
                            min="1"
                            max="60"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCustomDuration("shortBreak", customDurations.shortBreak + 1)}
                            disabled={customDurations.shortBreak >= 60}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Long Break</label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCustomDuration("longBreak", customDurations.longBreak - 1)}
                            disabled={customDurations.longBreak <= 1}
                          >
                            -
                          </Button>
                          <input
                            type="number"
                            value={customDurations.longBreak}
                            onChange={(e) => updateCustomDuration("longBreak", Number.parseInt(e.target.value) || 1)}
                            className="w-16 text-center border rounded px-2 py-1"
                            min="1"
                            max="120"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateCustomDuration("longBreak", customDurations.longBreak + 1)}
                            disabled={customDurations.longBreak >= 120}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={() => applyPreset("custom")} disabled={isRunning} size="sm">
                        Apply Custom Settings
                      </Button>
                      <Button
                        onClick={() => setCustomDurations({ work: 25, shortBreak: 6, longBreak: 35 })}
                        variant="outline"
                        size="sm"
                      >
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Settings Display */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-sm text-slate-600 mb-1">Current: {TIMER_PRESETS[currentPreset].name}</div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>Work: {Math.floor(getCurrentDurations().work / 60)}m</span>
                  <span>Short: {Math.floor(getCurrentDurations().shortBreak / 60)}m</span>
                  <span>Long: {Math.floor(getCurrentDurations().longBreak / 60)}m</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Timer */}
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${MODE_COLORS[mode]}`} />
                {MODE_LABELS[mode]}
                {mode === "work" && (
                  <Badge variant="secondary" className="ml-2">
                    Cycle {getCycleProgress()}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-8xl font-mono font-bold text-slate-800">{formatTime(timeLeft)}</div>

              <Progress value={getProgress()} className="h-2" />

              <div className="flex justify-center gap-4">
                <Button onClick={toggleTimer} size="lg" className="flex items-center gap-2">
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isRunning ? "Pause" : "Start"}
                </Button>

                <Button onClick={resetTimer} variant="outline" size="lg" className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
              </div>

              {!isRunning && (
                <p className="text-sm text-slate-500">
                  {mode === "work"
                    ? "Timer will enter full-screen focus mode when started"
                    : "Break time will show treats and activities to help you recharge"}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Completed Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{pomodoroData.completedSessions}</div>
                <p className="text-sm text-slate-500">Total pomodoros</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{pomodoroData.totalWorkTime}</div>
                <p className="text-sm text-slate-500">Minutes focused</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-800">{pomodoroData.currentStreak}</div>
                <p className="text-sm text-slate-500">Sessions today</p>
              </CardContent>
            </Card>
          </div>

          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Work: {Math.floor(getCurrentDurations().work / 60)} minutes</Badge>
                <Badge variant="secondary">
                  Short Break: {Math.floor(getCurrentDurations().shortBreak / 60)} minutes
                </Badge>
                <Badge variant="secondary">
                  Long Break: {Math.floor(getCurrentDurations().longBreak / 60)} minutes
                </Badge>
              </div>

              <div className="text-sm text-slate-600">
                <p>• Complete 4 work sessions to unlock a long break</p>
                <p>• Default: 6 minute short breaks, 35 minute long breaks</p>
                <p>• Full-screen break mode with treats and activities</p>
                <p>• Auto-start breaks or manual control</p>
                <p>• Settings and data are saved in your browser session</p>
              </div>

              <Button onClick={resetAllData} variant="destructive" size="sm" className="mt-4">
                Reset All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
