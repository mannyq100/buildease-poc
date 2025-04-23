import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/shared';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User as UserIcon } from 'lucide-react';

export function Account() {
  const { profile, auth0User } = useUserProfile();
  const navigate = useNavigate();

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account"
        description="Your profile details"
        icon={<UserIcon className="h-6 w-6" />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>View your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={profile.settings.pictureUrl || auth0User?.picture}
                alt={profile.name}
              />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-medium">{profile.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div><span className="font-semibold">Role:</span> {profile.role}</div>
            <div><span className="font-semibold">Tier:</span> {profile.tier}</div>
            <div><span className="font-semibold">Status:</span> {profile.status}</div>
            <div><span className="font-semibold">Provider:</span> {profile.provider}</div>
            <div><span className="font-semibold">Phone:</span> {profile.phone || '—'}</div>
            <div>
              <span className="font-semibold">Member since:</span>{' '}
              {new Date(profile.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div>
            <Button variant="default" onClick={() => navigate('/settings')}>Edit Profile</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
