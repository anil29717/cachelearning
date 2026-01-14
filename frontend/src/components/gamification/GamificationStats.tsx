import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, Star } from 'lucide-react';

interface GamificationStatsProps {
  stats: {
    total_xp: number;
    level: number;
    current_streak: number;
  };
  nextLevelXp: number;
  rank: number;
}

export function GamificationStats({ stats, nextLevelXp, rank }: GamificationStatsProps) {
  // Calculate progress percentage
  // Assuming levels: Beginner (0-500), Int (501-1500), Pro (1501-3000), Master (3001+)
  // We need to know previous level max to calculate relative progress for the bar
  // Simplified for MVP: Just use raw XP vs Next Level Max (or 0-100 if simple)
  
  // Let's define the ranges locally for visualization
  const LEVELS = [
    { min: 0, max: 500 },
    { min: 501, max: 1500 },
    { min: 1501, max: 3000 },
    { min: 3001, max: Infinity }
  ];
  
  const currentLevelRange = LEVELS[stats.level - 1] || LEVELS[LEVELS.length - 1];
  const prevMax = stats.level > 1 ? LEVELS[stats.level - 2].max : 0;
  const levelProgress = Math.min(100, Math.max(0, ((stats.total_xp - prevMax) / (currentLevelRange.max - prevMax)) * 100));

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Current Level</CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Level {stats.level}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total_xp} XP Total
          </p>
          <div className="mt-3">
             <div className="flex justify-between text-xs mb-1">
               <span>Progress</span>
               <span>{Math.round(levelProgress)}%</span>
             </div>
             <Progress value={levelProgress} className="h-2" />
             <p className="text-xs text-right mt-1 text-gray-400">Next Level: {currentLevelRange.max === Infinity ? 'Max' : currentLevelRange.max} XP</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Day Streak</CardTitle>
          <Flame className={`h-4 w-4 ${stats.current_streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.current_streak} Days</div>
          <p className="text-xs text-muted-foreground">
            Keep learning daily to increase your streak!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
          <Star className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">#{rank}</div>
          <p className="text-xs text-muted-foreground">
            Top {rank <= 10 ? '10!' : 'Player'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
