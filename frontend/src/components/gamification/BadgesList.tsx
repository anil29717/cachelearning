import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned_at?: string;
}

interface BadgesListProps {
  badges: Badge[]; // These are earned badges
}

const ALL_BADGES = [
  { name: 'First Lesson', description: 'Completed your first lesson', icon: 'check-circle' },
  { name: '7-Day Streak', description: 'Maintained a 7-day learning streak', icon: 'flame' },
  { name: 'Course Finisher', description: 'Completed a full course', icon: 'trophy' }
];

export function BadgesList({ badges }: BadgesListProps) {
  const earnedNames = new Set(badges.map(b => b.name));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Badges</CardTitle>
        <CardDescription>Unlock badges by completing milestones</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {ALL_BADGES.map((badge) => {
            const isEarned = earnedNames.has(badge.name);
            return (
              <TooltipProvider key={badge.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-colors ${isEarned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-60 grayscale'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isEarned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'}`}>
                        {isEarned ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                      </div>
                      <span className="text-xs text-center font-medium line-clamp-2">{badge.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs">{badge.description}</p>
                    {isEarned && <p className="text-xs text-green-500 mt-1">Earned ✅</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
