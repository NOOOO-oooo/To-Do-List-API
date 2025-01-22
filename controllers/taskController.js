const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const joi = require("joi");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const taskSchema = joi.object({
   title: joi.string().required(),
   description: joi.string().required(),
   list_id: joi.number().required(),
});

exports.createTask = async (req, res) => {
   try {
      const { error } = taskSchema.validate(req.body, { abortEarly: false });
      if (error) {
         return res.status(401).json({ error: error.message });
      }
      const taskPicture = req.file ? req.file.filename : undefined;
      const task = await prisma.tasks.create({
         data: {
            title: req.body.title,
            description: req.body.description,
            picture: taskPicture,
            list_id: parseInt(req.body.list_id),
            status: "Pending",
         },
      });
      return res
         .status(200)
         .json({ message: "Task created, Task info is:/n", task });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.editTaskDescription = async (req, res) => {
   try {
      const id = await prisma.tasks.findUnique({
         where: {
            task_id: parseInt(req.params.task_id),
         },
      });
      if (!req.params.task_id) {
         if (req.file) {
            fs.unlinkSync(req.file.path);
         }
         return res.status(401).json({ message: "Please enter a task ID" });
      }
      if (!id) {
         if (req.file) {
            fs.unlinkSync(req.file.path);
         }
         return res.status(404).json({
            message: `A task with the ID: ${parseInt(
               req.params.task_id
            )} Couldn't be found.`,
         });
      }
      const edit = await prisma.tasks.update({
         where: {
            task_id: parseInt(req.params.task_id),
         },
         data: {
            description: req.body.description,
         },
      });

      res.status(200).json({ message: "task description changed to:", edit });
   } catch (error) {
      if (req.file) {
         fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: error.message });
   }
};

exports.markAsDone = async (req, res) => {
   try {
      const id = await prisma.tasks.findUnique({
         where: {
            task_id: parseInt(req.params.task_id),
         },
      });
      if (!req.params.task_id) {
         return res.status(401).json({ message: "Please enter a task ID" });
      }
      if (!id) {
         return res.status(404).json({
            message: `A task with the ID: ${req.params.task_id} Couldn't be found.`,
         });
      }
      const edit = await prisma.tasks.update({
         where: {
            task_id: parseInt(req.params.task_id),
         },
         data: {
            status: "Done",
         },
      });

      res.status(200).json({ message: "task status changed" });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.editPic = async (req, res) => {
   try {
      const id = await prisma.tasks.findUnique({
         where: {
            task_id: parseInt(req.params.task_id),
         },
      });
      if (!req.params.task_id) {
         if (req.file) {
            fs.unlinkSync(req.file.path);
         }
         return res.status(401).json({ message: "Please enter a task ID" });
      }
      if (!id) {
         if (req.file) {
            fs.unlinkSync(req.file.path);
         }
         return res.status(404).json({
            message: `A task with the ID: ${parseInt(
               req.params.task_id
            )} Couldn't be found.`,
         });
      }
      const taskPicture = req.file.filename;
      const edit = await prisma.tasks.update({
         where: {
            task_id: parseInt(req.params.task_id),
         },
         data: {
            picture: taskPicture,
         },
      });
      return res.status(200).json({ message: "Image has been changed" });
   } catch (error) {
      if (req.file) {
         fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: error.message });
   }
};

exports.deletePic = async (req, res) => {
   try {
      const task = await prisma.tasks.findUnique({
         where: {
            task_id: parseInt(req.params.task_id),
         },
      });
      if (!task) {
         if (req.file) {
            fs.unlinkSync(req.file.path);
         }
         return res.status(404).json({ message: "task Not found" });
      }
      if (!req.params.task_id) {
         if (req.file) {
            fs.unlinkSync(req.file.path);
         }
         return res.status(401).josn({ message: "Please enter a task ID" });
      }

      if (task.picture) {
         const filePath = path.join("E:/To-do API/taskPics", task.picture);
         console.log(filePath);
         fs.unlink(filePath, (error) => {
            if (error) {
               if (req.file) {
                  fs.unlinkSync(req.file.path);
               }
               console.log(`Error deleting file `);
            } else {
               console.log(`Deleted pic path: ${filePath}`);
            }
         });
      }
      const fromDb = await prisma.tasks.update({
         where: {
            task_id: parseInt(req.params.task_id),
         },
         data: {
            picture: " ",
         },
      });
      return res.status(200).json({ message: "Deleted" });
   } catch (error) {
      if (req.file) {
         fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ error: error.message });
   }
};

exports.deleteTask = async (req, res) => {
   try {
      const task = await prisma.tasks.findUnique({
         where: {
            task_id: parseInt(req.params.task_id),
         },
      });
      if (task.picture) {
         const filePath = path.join("E:/To-do API/taskPics", task.picture);
         console.log(filePath);
         fs.unlink(filePath, (error) => {
            if (error) {
               if (req.file) {
                  fs.unlinkSync(req.file.path);
               }
               console.log(`Error deleting file `);
            } else {
               console.log(`Deleted pic path: ${filePath}`);
            }
         });
      }

      if (!task) {
         return res.status(404).json({ message: "task Not found" });
      }

      const target = await prisma.tasks.delete({
         where: { task_id: parseInt(req.params.task_id) },
      });
      return res.status(200).json({ message: "Task deleted", target });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};
