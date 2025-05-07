
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Bot, Cpu } from 'lucide-react';

const AdminAISystem: React.FC = () => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [modelTemperature, setModelTemperature] = useState(0.7);
  const [apiKey, setApiKey] = useState('');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            AI System Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable AI Features</h3>
              <p className="text-sm text-neutral-500">Toggle all AI-powered features</p>
            </div>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">API Configuration</h3>
            <Input
              type="password"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Model Settings</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Temperature</span>
                <span>{modelTemperature}</span>
              </div>
              <Slider
                value={[modelTemperature]}
                onValueChange={([value]) => setModelTemperature(value)}
                max={1}
                step={0.1}
              />
            </div>
          </div>

          <Button className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAISystem;
