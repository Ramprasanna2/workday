import mongoose from 'mongoose';
import { Goal } from '../model/model';

interface GoalData {
  employeeId: string;
  assignedBy: string;
  title: string;
  description?: string;
  dueDate?: Date;
  modules: { name: string; status?: 'Pending' | 'Completed' }[];
}

// Assign a goal to a specific employee
export const assignGoal = async (req: any, res: any) => {
  try {
    const data: GoalData = req.body;

    if (!mongoose.Types.ObjectId.isValid(data.employeeId) || !mongoose.Types.ObjectId.isValid(data.assignedBy)) {
      return res.status(400).json({ message: 'Invalid employee or assigner ID' });
    }

    const goal = new Goal({
      employeeId: new mongoose.Types.ObjectId(data.employeeId),
      assignedBy: new mongoose.Types.ObjectId(data.assignedBy),
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      modules: data.modules || [],
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning goal', error });
  }
};

// Update a module’s status (employee updates progress)
export const updateModuleStatus = async (req: any, res: any) => {
  try {
    const { goalId, moduleId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Only the assigned employee can update
    if (goal.employeeId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }

    const module = goal.modules.id(moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    module.status = status;
    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Error updating module status', error });
  }
};

// Update multiple modules’ status (employee updates progress)
export const updateMultipleModuleStatus = async (req: any, res: any) => {
  try {
    const { goalId } = req.params;
    const { updates } = req.body; // [{ moduleId, status }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array required' });
    }

    // Find goal
    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    // Update each module
    updates.forEach(({ moduleId, status }) => {
      const module = goal.modules.id(moduleId);
      if (module) module.status = status;
    });

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating module statuses', error });
  }
};

// Manager/Admin: Get all goals assigned to a specific employee
export const getEmployeeGoals = async (req: any, res: any) => {
  try {
    const { employeeId } = req.params;
    const goals = await Goal.find({ employeeId }).sort({ dueDate: 1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee goals", error });
  }
};

// Manager/Admin: Get all goals assigned by a specific manager
export const getAssignedGoals = async (req: any, res: any) => {
  try {
    const { managerId } = req.params;
    const goals = await Goal.find({ assignedBy: managerId }).sort({ dueDate: 1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching assigned goals", error });
  }
};

// Delete a goal (Manager/Admin)
export const deleteGoal = async (req: any, res: any) => {
  try {
    const { goalId } = req.params;
    const deletedGoal = await Goal.findByIdAndDelete(goalId);
    if (!deletedGoal) return res.status(404).json({ message: "Goal not found" });
    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error });
  }
};

// Add this function if it doesn't exist
export const getGoalsByEmployee = async (employeeId: string) => {
  try {
    console.log('Service: Getting goals for employee:', employeeId);
    
    const goals = await Goal.find({
      employeeId: new mongoose.Types.ObjectId(employeeId)
    })
    .populate('employeeId', 'name email')
    .populate('managerId', 'name email')
    .sort({ createdAt: -1 });
    
    console.log('Service: Found goals:', goals.length);
    return goals;
  } catch (error) {
    console.error('Service error getting goals by employee:', error);
    throw error;
  }
};