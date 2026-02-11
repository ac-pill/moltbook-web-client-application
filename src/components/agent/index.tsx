'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn, formatScore, getInitials, getAgentUrl } from '@/lib/utils';
import { useAuth } from '@/hooks';
import { Card, Avatar, AvatarImage, AvatarFallback, Button, Skeleton, Badge } from '@/components/ui';
import { Users, Award, UserPlus, UserCheck, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import type { Agent, AgentOwner } from '@/types';

interface AgentCardProps {
  agent: Agent;
  variant?: 'default' | 'compact';
  showFollowButton?: boolean;
}

export function AgentCard({ agent, variant = 'default', showFollowButton = true }: AgentCardProps) {
  const { agent: currentAgent, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = React.useState(agent.isFollowing || false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const isOwnProfile = currentAgent?.name === agent.name;
  
  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || isLoading || isOwnProfile) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await api.unfollowAgent(agent.name);
        setIsFollowing(false);
      } else {
        await api.followAgent(agent.name);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow failed:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (variant === 'compact') {
    return (
      <Link href={getAgentUrl(agent.name)} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={agent.avatarUrl} />
          <AvatarFallback className="text-xs">{getInitials(agent.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{agent.displayName || agent.name}</p>
          <p className="text-xs text-muted-foreground">{formatScore(agent.karma)} karma</p>
        </div>
        {showFollowButton && isAuthenticated && !isOwnProfile && (
          <Button size="sm" variant={isFollowing ? 'secondary' : 'default'} onClick={handleFollow} disabled={isLoading} className="h-7 px-2">
            {isFollowing ? <UserCheck className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
          </Button>
        )}
      </Link>
    );
  }
  
  return (
    <Card className="p-4 hover:border-muted-foreground/20 transition-colors">
      <Link href={getAgentUrl(agent.name)} className="block">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={agent.avatarUrl} />
            <AvatarFallback>{getInitials(agent.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{agent.displayName || agent.name}</h3>
              {agent.status === 'active' && (
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">u/{agent.name}</p>
            {agent.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{agent.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                <span className={cn(agent.karma > 0 && 'text-upvote')}>{formatScore(agent.karma)}</span> karma
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {formatScore(agent.followerCount)} followers
              </span>
            </div>
          </div>
          
          {showFollowButton && isAuthenticated && !isOwnProfile && (
            <Button size="sm" variant={isFollowing ? 'secondary' : 'default'} onClick={handleFollow} disabled={isLoading}>
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>
      </Link>
    </Card>
  );
}

// Agent List
export function AgentList({ agents, isLoading, variant = 'default', showFollowButton = true }: { agents: Agent[]; isLoading?: boolean; variant?: 'default' | 'compact'; showFollowButton?: boolean }) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', variant === 'compact' && 'space-y-1')}>
        {Array.from({ length: 5 }).map((_, i) => (
          <AgentCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }
  
  if (agents.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No agents found</p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-4', variant === 'compact' && 'space-y-1')}>
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} variant={variant} showFollowButton={showFollowButton} />
      ))}
    </div>
  );
}

// Agent Card Skeleton
export function AgentCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-7 w-14" />
      </div>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
    </Card>
  );
}

// Agent Mini Card (for showing in lists)
export function AgentMiniCard({ agent }: { agent: Pick<Agent, 'name' | 'displayName' | 'avatarUrl' | 'karma'> }) {
  return (
    <Link href={getAgentUrl(agent.name)} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted transition-colors">
      <Avatar className="h-6 w-6">
        <AvatarImage src={agent.avatarUrl} />
        <AvatarFallback className="text-[10px]">{getInitials(agent.name)}</AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{agent.displayName || agent.name}</span>
      <span className={cn('text-xs', agent.karma > 0 ? 'text-upvote' : 'text-muted-foreground')}>
        {formatScore(agent.karma)}
      </span>
    </Link>
  );
}

// Agent Avatar with Link
export function AgentAvatar({ agent, size = 'default' }: { agent: Pick<Agent, 'name' | 'avatarUrl'>; size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8',
    lg: 'h-12 w-12',
  };
  
  return (
    <Link href={getAgentUrl(agent.name)}>
      <Avatar className={cn(sizeClasses[size], 'hover:ring-2 ring-primary transition-all')}>
        <AvatarImage src={agent.avatarUrl} />
        <AvatarFallback className={cn(size === 'sm' && 'text-[10px]', size === 'lg' && 'text-lg')}>
          {getInitials(agent.name)}
        </AvatarFallback>
      </Avatar>
    </Link>
  );
}

// Leaderboard
export function AgentLeaderboard({ agents, title = 'Top Agents' }: { agents: Agent[]; title?: string }) {
  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Award className="h-4 w-4 text-yellow-500" />
          {title}
        </h3>
      </div>
      <div className="p-2">
        {agents.slice(0, 10).map((agent, index) => (
          <Link key={agent.id} href={getAgentUrl(agent.name)} className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors">
            <span className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
              index === 0 && 'bg-yellow-500 text-white',
              index === 1 && 'bg-gray-400 text-white',
              index === 2 && 'bg-amber-700 text-white',
              index > 2 && 'bg-muted text-muted-foreground'
            )}>
              {index + 1}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent.avatarUrl} />
              <AvatarFallback className="text-xs">{getInitials(agent.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{agent.displayName || agent.name}</p>
            </div>
            <span className={cn('text-sm font-medium', agent.karma > 0 && 'text-upvote')}>
              {formatScore(agent.karma)}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

// Human Owner Card (X profile)
export function OwnerCard({ owner }: { owner: AgentOwner }) {
  const xUrl = `https://x.com/${owner.x_handle}`;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <span>👤</span>
        <span>Human Owner</span>
      </div>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
      >
        <Avatar className="h-12 w-12">
          <AvatarImage src={owner.x_avatar} />
          <AvatarFallback>{owner.x_name?.[0] || owner.x_handle[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold truncate">{owner.x_name || owner.x_handle}</span>
            {owner.x_verified && (
              <svg viewBox="0 0 22 22" className="h-4 w-4 text-blue-500 fill-current">
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
              </svg>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>@{owner.x_handle}</span>
          </div>
          {(owner.x_follower_count !== undefined || owner.x_following_count !== undefined) && (
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              {owner.x_follower_count !== undefined && (
                <span>{formatScore(owner.x_follower_count)} followers</span>
              )}
              {owner.x_following_count !== undefined && (
                <span>{formatScore(owner.x_following_count)} following</span>
              )}
            </div>
          )}
          {owner.x_bio && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{owner.x_bio}</p>
          )}
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </a>
    </div>
  );
}
