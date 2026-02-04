"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Settings, Flame, BookOpen, Sparkles, Trophy, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HomeScreenProps {
  pendingCount?: number
  totalCount?: number
  streak?: number
  accuracy?: number
  level?: number
  xp?: number
  xpToNext?: number
}

const motivationalMessages = [
  "今日も一歩前進しよう!",
  "継続は力なり!",
  "やればできる!",
  "学びを楽しもう!",
  "今日も成長できる!",
]

function ProgressRing({ 
  progress, 
  size = 160, 
  strokeWidth = 10 
}: { 
  progress: number
  size?: number
  strokeWidth?: number 
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedProgress / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100)
    return () => clearTimeout(timer)
  }, [progress])

  return (
    <svg width={size} height={size} className="transform -rotate-90 drop-shadow-lg">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="oklch(0.65 0.26 265)" />
          <stop offset="100%" stopColor="oklch(0.72 0.2 320)" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-secondary"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  )
}

function XPBar({ current, max }: { current: number; max: number }) {
  const progress = (current / max) * 100
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">XP</span>
        <span className="text-xp font-bold">{current} / {max}</span>
      </div>
      <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-xp to-success"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  colorClass,
  bgClass,
  delay = 0
}: { 
  icon: React.ElementType
  value: string | number
  label: string
  colorClass: string
  bgClass: string
  delay?: number
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <Card className={cn(
      "border-0 shadow-lg transition-all duration-500 overflow-hidden",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <CardContent className="flex flex-col items-center py-5 px-3 relative">
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 rounded-t-lg",
          bgClass
        )} />
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-2xl mb-3",
          bgClass
        )}>
          <Icon className={cn("h-6 w-6", colorClass)} />
        </div>
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      </CardContent>
    </Card>
  )
}

function FloatingEmoji({ emoji, delay }: { emoji: string; delay: number }) {
  return (
    <span 
      className="absolute text-2xl animate-bounce"
      style={{ 
        animationDelay: `${delay}s`,
        animationDuration: "2s"
      }}
    >
      {emoji}
    </span>
  )
}

export function HomeScreen({ 
  pendingCount = 12, 
  totalCount = 48,
  streak = 7,
  accuracy = 85,
  level = 5,
  xp = 350,
  xpToNext = 500
}: HomeScreenProps) {
  const completionRate = totalCount > 0 ? ((totalCount - pendingCount) / totalCount) * 100 : 0
  const [message] = useState(
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]
  )
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (streak >= 7) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [streak])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            LearnLoop
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-xl">
          <Settings className="h-5 w-5" />
          <span className="sr-only">設定</span>
        </Button>
      </header>

      <main className="px-5 pb-8">
        {/* Level & XP */}
        <Card className="border-0 bg-gradient-to-r from-primary/10 to-accent/10 shadow-lg mb-4">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <span className="text-2xl font-bold text-primary-foreground">Lv.{level}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">レベル {level}</span>
                </div>
                <XPBar current={xp} max={xpToNext} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Questions Card */}
        <Card className="border-0 bg-card shadow-xl overflow-hidden">
          <CardContent className="flex flex-col items-center py-8 relative">
            {/* Decorative background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent" />
            
            <p className="text-sm font-semibold text-primary mb-2 relative">{message}</p>
            <p className="text-xs text-muted-foreground mb-4 relative">今日の問題</p>
            
            <div className="relative flex items-center justify-center mb-4">
              <ProgressRing progress={completionRate} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-foreground">{pendingCount}</span>
                <span className="text-sm text-muted-foreground">問 待機中</span>
              </div>
            </div>

            <Link href="/quiz" className="w-full mt-4 relative">
              <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <Zap className="w-5 h-5 mr-2" />
                学習を始める
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <StatCard 
            icon={Flame}
            value={streak}
            label="連続日数"
            colorClass="text-streak"
            bgClass="bg-streak/20"
            delay={100}
          />
          <StatCard 
            icon={Sparkles}
            value={`${accuracy}%`}
            label="正答率"
            colorClass="text-success"
            bgClass="bg-success/20"
            delay={200}
          />
          <StatCard 
            icon={BookOpen}
            value={totalCount}
            label="総問題数"
            colorClass="text-primary"
            bgClass="bg-primary/20"
            delay={300}
          />
        </div>

        {/* Streak Celebration */}
        {streak >= 7 && (
          <Card className="border-0 bg-gradient-to-r from-streak/20 to-accent/20 mt-6 overflow-hidden">
            <CardContent className="py-4 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-streak to-accent flex items-center justify-center shadow-lg">
                  <Flame className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground">すごい! {streak}日連続!</p>
                  <p className="text-sm text-muted-foreground">この調子で頑張ろう!</p>
                </div>
              </div>
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingEmoji emoji="🎉" delay={0} />
                  <FloatingEmoji emoji="✨" delay={0.3} />
                  <FloatingEmoji emoji="🔥" delay={0.6} />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Link */}
        <div className="mt-8">
          <Link href="/admin">
            <Button variant="outline" className="w-full h-12 rounded-2xl bg-transparent hover:bg-secondary/50 border-2 border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all">
              問題を管理する
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
