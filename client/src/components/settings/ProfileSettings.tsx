import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  profilePic?: string;
  location?: string;
  phoneNumber?: string;
}

interface ProfileSettingsProps {
  user: User;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const { toast } = useToast();
  const [formData, setFormData] = React.useState({
    fullName: user.fullName || '',
    email: user.email,
    phoneNumber: user.phoneNumber || '',
    location: user.location || '',
    bio: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully.",
    });
  };
  
  const handleAvatarChange = () => {
    // In a real implementation, this would open a file picker
    toast({
      title: "Coming Soon",
      description: "Avatar upload functionality will be available soon.",
    });
  };
  
  const userInitials = user.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.username.substring(0, 2).toUpperCase();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24">
            {user.profilePic && <AvatarImage src={user.profilePic} alt={user.fullName} />}
            <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
          </Avatar>
          <button
            className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md"
            onClick={handleAvatarChange}
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold">{user.fullName || user.username}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.email}</p>
          <p className="text-sm">Username: {user.username}</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself"
            rows={4}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
