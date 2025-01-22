const { PrismaClient } = require("@prisma/client");
const joi = require("joi");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const newListSchema = joi.object({
   name: joi.string().required(),
});

exports.createList = async (req, res) => {
   const headerAccessToken = req.headers.authorization;
   const decodedAccessToken = await jwt.decode(
      headerAccessToken,
      process.env.accessToken_secret
   );
   const id = decodedAccessToken.user_id;
   try {
      const { error } = newListSchema.validate(req.body, { abortEarly: false });
      if (error) {
         return res.status(401).json({ error: error.message });
      }

      const newList = await prisma.lists.create({
         data: {
            name: req.body.name,
            tasks_count: 0,
            user_id: id,
         },
      });
      return res.status(200).json({
         message: `List created successfully at ${newList.date_created}`,
         newList,
      });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.deleteList = async (req, res) => {
   try {
      if (!parseInt(req.params.list_id)) {
         return res.status(401).json({ message: "enter a valid ID" });
      }
      const target = await prisma.lists.delete({
         where: {
            list_id: parseInt(req.params.list_id),
         },
      });
      return res.status(200).json({ message: "List deleted!" });
   } catch (error) {
      return res.status(500).json({
         error: error.message,
      });
   }
};

exports.updateList = async (req, res) => {
   try {
      const list = await prisma.lists.update({
         where: {
            list_id: parseInt(req.params.list_id),
         },
         data: {
            name: req.body.name,
         },
      });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.getAll = async (req, res) => {
   try {
      const lists = await prisma.lists.findMany({});
      return res.status(200).json({ lists, count: lists.length });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};

exports.showListTasks = async (req, res) => {
   try {
      const tasks = await prisma.tasks.findMany({
         where: {
            list_id: parseInt(req.params.list_id),
         },
      });
      return res.status(200).json({ count: tasks.length, tasks: tasks });
   } catch (error) {
      return res.status(500).json({ error: error.message });
   }
};
