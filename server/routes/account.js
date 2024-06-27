import multer from 'multer';
import express from "express";
import Student from "../controller/student.js";

// middleware that handles the file upload
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/student/create", upload.single('certificate'), Student.create);

export default router;