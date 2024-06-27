
import mongoose from "mongoose";
import Student from "../model/student.js";
import Schedule from "../model/schedule.js";
import Classroom from "../model/classroom.js";

// Load environment variables from .env file
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + '/../.env' });

mongoose.Promise = global.Promise;

const Database = {};
Database.mongoose  = mongoose;
Database.url       = process.env.MONGOURL;
Database.Student   = Student(mongoose);
Database.Schedule  = Schedule(mongoose);
Database.Classroom = Classroom(mongoose);


export default Database;