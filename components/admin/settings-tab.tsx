"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface SettingsTabProps {
  currentPhase: string
  onPhaseChange: (phase: string) => void
}

export default function SettingsTab({ currentPhase, onPhaseChange }: SettingsTabProps) {
  const { toast } = useToast()

  const handlePhaseChange = (value: string) => {
    onPhaseChange(value)
  }

  const handleResetData = () => {
    // This would typically clear the database
    // For this demo, we'll just show a toast
    toast({
      title: "Data reset",
      description: "All judging data has been reset",
    })
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Judging Phase</CardTitle>
          <CardDescription>Control the current judging phase of the hackathon</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentPhase} onValueChange={handlePhaseChange} className="space-y-4">
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="expo" id="expo" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="expo" className="font-medium">
                  Expo Judging (Phase 1)
                </Label>
                <p className="text-sm text-muted-foreground">Judges compare projects in pairs to determine finalists</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="panel" id="panel" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="panel" className="font-medium">
                  Panel Judging (Phase 2)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Judges evaluate finalist projects using a detailed rubric
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Reset or export judging data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Button variant="destructive" onClick={handleResetData}>
              Reset All Data
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">
              This will delete all projects, judges, and judging data. This action cannot be undone.
            </p>
          </div>

          <div>
            <Button variant="outline">Export Data (CSV)</Button>
            <p className="mt-2 text-sm text-muted-foreground">
              Download all judging data as CSV files for backup or analysis.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
