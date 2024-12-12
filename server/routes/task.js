const router = require("express").Router();
const authenticateToken = require("../models/auth/auth");
const Task = require("../models/task");
const User = require("../models/user");

// Create Task
router.post("/create-task",authenticateToken, async (req, res) => {
  const { title, desc } = req.body;
  const { id } = req.headers;

  if (!id) {
    return res.status(400).json({ message: "User ID is required in headers" });
  }

  try {
    // Create new task
    const newTask = new Task({
      title: title,
      desc: desc,
    });

    // Save the task
    const savedTask = await newTask.save();

    // Add task reference to the user's task list
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $push: { tasks: savedTask._id } },
      { new: true } // This option returns the updated user document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with success message
    res.status(200).json({
      message: "Task created and associated with user successfully",
      task: savedTask,
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        _id: updatedUser._id,
      },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/get-all-tasks", authenticateToken, async (req, res) => {
    try {
      const { id } = req.headers; // Get the authenticated user's ID from the token
  
      // Find the user by ID and populate the 'tasks' field (this loads the actual task data)
      const userData = await User.findById(id).populate({
        path:"tasks",
        opstions:{sort:{createdAt:-1}}
      });
  
      // Respond with the user's tasks
      res.status(200).json({
        data:userData// Return the populated tasks array
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  router.delete("/delete-task/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params; // Get the task ID from the URL parameter
      const { userId } = req.user; // Extract user ID from the decoded token (from authenticateToken middleware)
  
      // First, delete the task from the Task collection
      await Task.findByIdAndDelete(id);
  
      // Then, remove the task reference from the user's tasks array in the User collection
      await User.findByIdAndUpdate(userId, { $pull: { tasks: id } });
  
      res.status(200).json({ message: "Task deleted successfully" });
    } catch (err) {
      console.error("Error deleting task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  


//   //--------------------------------
//   router.put("/update-task/:id", authenticateToken, async (req, res) => {
//     try {
//       const { id } = req.params; // Get the task ID from the URL
//       const { userId } = req.user; // Extract user ID from the decoded token
  
//       // Get the updated task details from the request body
//       const { title, desc } = req.body;
  
//       // Find the task by its ID
//       const task = await Task.findByIdAndUpdate(id,{title:title,desc:desc});
  
//       res.status(200).json({
//         message: "Task updated successfully",
//         task,
//       });
//     } catch (err) {
//       console.error("Error updating task:", err);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

    
//   router.put("/update-imp-task/:id", authenticateToken, async (req, res) => {
//     try {
//       const { id } = req.params; // Get the task ID from the URL
//       const taskData=await Task.findById(id);
//       const impTask=taskData.important;

  
//       // Get the updated task details from the request body
//       const { title, desc } = req.body;
  
//       // Find the task by its ID
//       const task = await Task.findByIdAndUpdate(id,{important:!impTask});
  
//       res.status(200).json({
//         message: "Task updated successfully",
//         task,
//       });
//     } catch (err) {
//       console.error("Error updating task:", err);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });
  

//   router.get("/get-complete-task/:id", authenticateToken, async (req, res) => {
//     try {

//         const { id } = req.headers; // Get the authenticated user's ID from the token
  
//         // Find the user by ID and populate the 'tasks' field (this loads the actual task data)
//         const Data = await User.findById(id).populate({
//           path:"tasks",
//           opstions:{sort:{createdAt:-1}},
//           match:{complete:true}
//         });
//     const impData=Data.tasks;
//         // Respond with the user's tasks
//         res.status(200).json({
//           data:impData// Return the populated tasks array
//         });
  
//     } catch (err) {
//       console.error("Error updating task:", err);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });

  
//   router.get("/get-complete-task/:id", authenticateToken, async (req, res) => {
//     try {

//         const { id } = req.headers; // Get the authenticated user's ID from the token
  
//         // Find the user by ID and populate the 'tasks' field (this loads the actual task data)
//         const Data = await User.findById(id).populate({
//           path:"tasks",
//           opstions:{sort:{createdAt:-1}},
//           match:{incomplete:false}
//         });
//     const impData=Data.tasks;
//         // Respond with the user's tasks
//         res.status(200).json({
//           data:impData// Return the populated tasks array
//         });
  
//     } catch (err) {
//       console.error("Error updating task:", err);
//       res.status(500).json({ message: "Internal server error" });
//     }
//   });


router.put("/update-task/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params; // Get the task ID from the URL
      const { userId } = req.user; // Extract user ID from the decoded token
  
      // Get the updated task details from the request body
      const { title, desc } = req.body;
  
      // Find the task by its ID and update it
      const task = await Task.findByIdAndUpdate(
        id,
        { title, desc },
        { new: true } // This option returns the updated task
      );
  
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      res.status(200).json({
        message: "Task updated successfully",
        task,
      });
    } catch (err) {
      console.error("Error updating task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  
  router.put("/update-imp-task/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params; // Get the task ID from the URL
  
      // Find the task by ID to get its current 'important' status
      const taskData = await Task.findById(id);
      if (!taskData) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      const updatedTask = await Task.findByIdAndUpdate(
        id,
        { important: !taskData.important }, // Toggle the 'important' field
        { new: true } // This option returns the updated task
      );
  
      res.status(200).json({
        message: "Task importance updated successfully",
        task: updatedTask,
      });
    } catch (err) {
      console.error("Error updating task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  
  router.get("/get-complete-task", authenticateToken, async (req, res) => {
    try {
      const { id } = req.headers; // Get the authenticated user's ID from the headers
  
      // Find the user by ID and populate the 'tasks' field where complete is true
      const userData = await User.findById(id).populate({
        path: "tasks", // The field in the user schema
        options: {
          sort: { createdAt: -1 }, // Sort tasks by creation date in descending order
        },
        match: { complete: true }, // Only return tasks where 'complete' is true
      });
  
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Respond with the completed tasks
      res.status(200).json({
        data: userData.tasks, // Return the populated tasks array
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  

  router.get("/get-incomplete-task", authenticateToken, async (req, res) => {
    try {
      const { id } = req.headers; // Get the authenticated user's ID from the headers
  
      // Find the user by ID and populate the 'tasks' field where complete is false
      const userData = await User.findById(id).populate({
        path: "tasks", // The field in the user schema
        options: {
          sort: { createdAt: -1 }, // Sort tasks by creation date in descending order
        },
        match: { complete: false }, // Only return tasks where 'complete' is false
      });
  
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Respond with the incomplete tasks
      res.status(200).json({
        data: userData.tasks, // Return the populated tasks array
      });
    } catch (err) {
      console.error("Error fetching tasks:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
module.exports = router;
