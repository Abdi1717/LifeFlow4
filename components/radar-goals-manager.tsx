'use client';

import { useState } from 'react';
import { useRadar } from '@/lib/contexts/radar-context';
import { RadarGoal, RadarGoalMilestone } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Trash2, PlusCircle, Edit, CheckCircle, X, Target, Award, ChevronRight, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface GoalFormData {
  areaId: string;
  title: string;
  description: string;
  targetValue: number;
  targetDate: string;
  startValue: number;
  startDate: string;
}

interface MilestoneFormData {
  description: string;
  value: number;
}

export function RadarGoalsManager() {
  const { 
    areas, 
    goals, 
    getActiveGoals, 
    getCompletedGoals, 
    addGoal, 
    updateGoal, 
    removeGoal,
    addGoalMilestone,
    updateGoalMilestone,
    removeGoalMilestone,
    calculateGoalProgress,
    getLatestEntry
  } = useRadar();
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [selectedGoal, setSelectedGoal] = useState<RadarGoal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);
  
  const [goalForm, setGoalForm] = useState<GoalFormData>({
    areaId: areas.length > 0 ? areas[0].id : '',
    title: '',
    description: '',
    targetValue: 10,
    targetDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    startValue: 1,
    startDate: format(new Date(), 'yyyy-MM-dd')
  });
  
  const [milestoneForm, setMilestoneForm] = useState<MilestoneFormData>({
    description: '',
    value: 5
  });
  
  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const latestEntry = getLatestEntry();

  // Reset the form for a new goal
  const resetGoalForm = () => {
    setGoalForm({
      areaId: areas.length > 0 ? areas[0].id : '',
      title: '',
      description: '',
      targetValue: 10,
      targetDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      startValue: 1,
      startDate: format(new Date(), 'yyyy-MM-dd')
    });
    setIsEditing(false);
    setSelectedGoal(null);
  };
  
  // Reset the milestone form
  const resetMilestoneForm = () => {
    setMilestoneForm({
      description: '',
      value: 5
    });
  };

  // Handle goal form changes
  const handleGoalFormChange = (field: keyof GoalFormData, value: string | number) => {
    setGoalForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle milestone form changes
  const handleMilestoneFormChange = (field: keyof MilestoneFormData, value: string | number) => {
    setMilestoneForm(prev => ({ ...prev, [field]: value }));
  };

  // Submit goal form
  const handleSubmitGoal = () => {
    if (isEditing && selectedGoal) {
      // Update existing goal
      updateGoal(selectedGoal.id, {
        areaId: goalForm.areaId,
        title: goalForm.title,
        description: goalForm.description,
        targetValue: Number(goalForm.targetValue),
        targetDate: goalForm.targetDate,
        startValue: Number(goalForm.startValue),
        startDate: goalForm.startDate
      });
    } else {
      // Add new goal
      addGoal({
        areaId: goalForm.areaId,
        title: goalForm.title,
        description: goalForm.description,
        targetValue: Number(goalForm.targetValue),
        targetDate: goalForm.targetDate,
        startValue: Number(goalForm.startValue),
        startDate: goalForm.startDate,
        completed: false,
        milestones: []
      });
    }
    
    resetGoalForm();
  };

  // Submit milestone form
  const handleSubmitMilestone = () => {
    if (!selectedGoal) return;
    
    addGoalMilestone(selectedGoal.id, {
      description: milestoneForm.description,
      value: Number(milestoneForm.value),
      completed: false
    });
    
    resetMilestoneForm();
  };

  // Handle editing a goal
  const handleEditGoal = (goal: RadarGoal) => {
    setSelectedGoal(goal);
    setGoalForm({
      areaId: goal.areaId,
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue,
      targetDate: goal.targetDate,
      startValue: goal.startValue,
      startDate: goal.startDate
    });
    setIsEditing(true);
  };

  // Handle deleting a goal
  const handleDeleteGoal = () => {
    if (selectedGoal) {
      removeGoal(selectedGoal.id);
      resetGoalForm();
      setDeleteDialogOpen(false);
    }
  };

  // Handle milestone completion toggle
  const handleToggleMilestoneCompletion = (goalId: string, milestoneId: string, completed: boolean) => {
    updateGoalMilestone(goalId, milestoneId, {
      completed,
      date: completed ? format(new Date(), 'yyyy-MM-dd') : undefined
    });
  };

  // Handle deleting a milestone
  const handleDeleteMilestone = (goalId: string, milestoneId: string) => {
    removeGoalMilestone(goalId, milestoneId);
    setDeleteMilestoneId(null);
  };

  // Handle goal completion toggle
  const handleToggleGoalCompletion = (goalId: string, completed: boolean) => {
    updateGoal(goalId, { completed });
  };

  // Get area name from ID
  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : 'Unknown Area';
  };

  // Get area color from ID
  const getAreaColor = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    return area?.color || '#888888';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Personal Growth Goals</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={resetGoalForm}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
              <DialogDescription>
                Set a measurable goal for your personal growth in a specific area
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="area">Growth Area</Label>
                <Select 
                  value={goalForm.areaId} 
                  onValueChange={(value) => handleGoalFormChange('areaId', value)}
                >
                  <SelectTrigger id="area">
                    <SelectValue placeholder="Select an area" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={goalForm.title}
                  onChange={(e) => handleGoalFormChange('title', e.target.value)}
                  placeholder="e.g., Improve cardio endurance"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={goalForm.description}
                  onChange={(e) => handleGoalFormChange('description', e.target.value)}
                  placeholder="Describe your goal and why it's important to you"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startValue">Starting Value (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="startValue"
                      min={1}
                      max={10}
                      step={1}
                      value={[Number(goalForm.startValue)]}
                      onValueChange={(value) => handleGoalFormChange('startValue', value[0])}
                    />
                    <span className="w-8 text-center">{goalForm.startValue}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetValue">Target Value (1-10)</Label>
                  <div className="flex items-center space-x-2">
                    <Slider
                      id="targetValue"
                      min={1}
                      max={10}
                      step={1}
                      value={[Number(goalForm.targetValue)]}
                      onValueChange={(value) => handleGoalFormChange('targetValue', value[0])}
                    />
                    <span className="w-8 text-center">{goalForm.targetValue}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={goalForm.startDate}
                    onChange={(e) => handleGoalFormChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={goalForm.targetDate}
                    onChange={(e) => handleGoalFormChange('targetDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetGoalForm}>Cancel</Button>
              <Button type="submit" onClick={handleSubmitGoal}>
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as 'active' | 'completed')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Goals ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed Goals ({completedGoals.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No active goals</h3>
              <p className="text-muted-foreground mb-4">
                Create a new goal to track your personal growth journey
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button onClick={resetGoalForm}>Create First Goal</Button>
                </DialogTrigger>
                {/* Dialog content is reused from above */}
              </Dialog>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map(goal => {
                const progress = calculateGoalProgress(goal.id);
                const areaColor = getAreaColor(goal.areaId);
                const timeRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <Card key={goal.id} className="overflow-hidden">
                    <div 
                      className="h-2" 
                      style={{ backgroundColor: areaColor }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                          <CardDescription>
                            {getAreaName(goal.areaId)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditGoal(goal)}
                            aria-label="Edit goal"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedGoal(goal); setDeleteDialogOpen(true); }}
                            aria-label="Delete goal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {goal.description && (
                        <p className="text-sm mb-3">{goal.description}</p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress.progress)}%</span>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground block">Current</span>
                            <span className="font-medium">{progress.currentValue}/10</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Target</span>
                            <span className="font-medium">{goal.targetValue}/10</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Deadline</span>
                            <span className={`font-medium ${timeRemaining < 7 ? 'text-orange-500' : ''}`}>
                              {timeRemaining <= 0 
                                ? 'Overdue' 
                                : `${timeRemaining} days`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {goal.milestones && goal.milestones.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-2">Milestones</h4>
                          <ScrollArea className="h-[100px]">
                            <div className="space-y-1">
                              {goal.milestones.map(milestone => (
                                <div 
                                  key={milestone.id} 
                                  className="flex items-center justify-between py-1 border-b border-muted last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleToggleMilestoneCompletion(goal.id, milestone.id, !milestone.completed)}
                                    >
                                      {milestone.completed 
                                        ? <CheckCircle className="h-4 w-4 text-green-500" /> 
                                        : <div className="h-4 w-4 rounded-full border border-muted-foreground" />}
                                    </Button>
                                    <span className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {milestone.description} ({milestone.value}/10)
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => setDeleteMilestoneId(milestone.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedGoal(goal)}
                          >
                            <PlusCircle className="mr-1 h-3 w-3" />
                            Add Milestone
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Add Goal Milestone</DialogTitle>
                            <DialogDescription>
                              Create smaller targets on your way to the main goal
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="milestone-description">Milestone Description</Label>
                              <Input
                                id="milestone-description"
                                value={milestoneForm.description}
                                onChange={(e) => handleMilestoneFormChange('description', e.target.value)}
                                placeholder="e.g., Run 5K without stopping"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="milestone-value">Value to Reach (1-10)</Label>
                              <div className="flex items-center space-x-2">
                                <Slider
                                  id="milestone-value"
                                  min={1}
                                  max={10}
                                  step={1}
                                  value={[Number(milestoneForm.value)]}
                                  onValueChange={(value) => handleMilestoneFormChange('value', value[0])}
                                />
                                <span className="w-8 text-center">{milestoneForm.value}</span>
                              </div>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button variant="outline" onClick={resetMilestoneForm}>Cancel</Button>
                            <Button onClick={handleSubmitMilestone}>Add Milestone</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Mark as Complete</span>
                        <Switch
                          checked={goal.completed}
                          onCheckedChange={(checked) => handleToggleGoalCompletion(goal.id, checked)}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {completedGoals.length === 0 ? (
            <div className="text-center py-8">
              <Award className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No completed goals yet</h3>
              <p className="text-muted-foreground">
                Your completed goals will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedGoals.map(goal => (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-lg">{goal.title}</CardTitle>
                        </div>
                        <CardDescription>
                          {getAreaName(goal.areaId)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(goal.targetDate), 'MMM d, yyyy')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {goal.description && (
                      <p className="text-sm mb-3">{goal.description}</p>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground block">Started at</span>
                        <span className="font-medium">{goal.startValue}/10</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Achieved</span>
                        <span className="font-medium">{goal.targetValue}/10</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleGoalCompletion(goal.id, false)}
                    >
                      <ChevronRight className="mr-1 h-4 w-4" />
                      Move to Active
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Delete Goal Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this goal and all its milestones. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGoal}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Milestone Confirmation Dialog */}
      <AlertDialog 
        open={deleteMilestoneId !== null} 
        onOpenChange={(open) => !open && setDeleteMilestoneId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Milestone?</AlertDialogTitle>
            <AlertDialogDescription>
              This milestone will be permanently removed from this goal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedGoal && deleteMilestoneId && 
                handleDeleteMilestone(selectedGoal.id, deleteMilestoneId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 