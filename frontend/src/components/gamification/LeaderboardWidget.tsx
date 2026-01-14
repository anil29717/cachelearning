import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient } from '@/utils/api';
import { Trophy } from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  avatar_url: string;
  total_xp: number;
  level: number;
  current_streak: number;
}

export function LeaderboardWidget() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getLeaderboard()
      .then(res => setLeaderboard(res.leaderboard))
      .catch(err => console.error('Failed to load leaderboard', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-40 animate-pulse bg-gray-100 rounded-lg"></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Learners
        </CardTitle>
        <CardDescription>Weekly top performers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'
                }`}>
                  {index + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Level {user.level}</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-right">
                <div>{user.total_xp} XP</div>
                {user.current_streak > 0 && (
                   <div className="text-xs text-orange-500 font-normal">{user.current_streak} day streak</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
