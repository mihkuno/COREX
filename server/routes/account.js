import multer from 'multer';
import express from "express";
import Student from "../controller/student.js";

// middleware that handles the file upload
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post("/student/create", upload.single('certificate'), Student.create);
router.delete("/student/remove/:id", Student.remove);
router.get("/student/info/:id", Student.getInfo);
router.get("/student/name/:id", Student.getName);
router.get("/student/schedule/:id", Student.getSchedule);
router.put("/student/contact/:id/:no", Student.putContact);

export default router;