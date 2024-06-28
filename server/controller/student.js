import Database from "../lib/database.js";
import Extractor from "../lib/extractor.js";

import { access, mkdir, writeFile } from 'fs/promises';
import { fileTypeFromBuffer } from 'file-type';
import { createHash } from 'crypto';
        
async function create(req, res) {
    
    // if not a pdf, return an error
    const fileInfo = await fileTypeFromBuffer(req.file.buffer);
    if (!(fileInfo !== undefined && fileInfo.mime === 'application/pdf')) {
        return res.status(400).send({ 
            message: 'Only PDF files are allowed.' 
        });
    }
    
    try {
            
        // extract the data from the PDF
        let { Student, Schedule } = await Extractor.getCorInformation(req.file.buffer);
        
        // TODO: replace when auth is added
        // Student.email_address   = req.body.email_address;
        // Student.email_name      = req.body.email_name;
        

        // find if the certificate hash already exists
        const isCertificateExist = await Database.Student.findOne(
            { certificate: Student.certificate });

        if (!isCertificateExist) {       
            Student = await Database.Student(Student).save();
            console.log('Certificate creation successful.');
        }
        else {
            Student = isCertificateExist;

            // send exists message
            return res.status(409).send({ 
                message: 'This certificate already exists.' 
            });
        }

        // reference of the student in schedule collection
        const StudentReference = { 
            first_name:     Student.first_name, 
            last_name:      Student.last_name, 
            student_id:     Student.student_id, 
            certificate:    Student.certificate,
        };

        await Database.Schedule.bulkWrite(
            Schedule.map(schedule => {
                return {
                    updateOne: {
                        filter: {
                            section:        schedule.section,
                            start_time:     schedule.start_time,
                            end_time:       schedule.end_time,
                            day:            schedule.day,
                            semester:       schedule.semester,
                            start_year:     schedule.start_year,
                            end_year:       schedule.end_year,
                            Course:         { ...schedule.Course }, 
                            Instructor:     { ...schedule.Instructor }, 
                            Classroom:      { ...schedule.Classroom }
                        },
                        update: {
                            $addToSet: { Students: StudentReference }
                        },
                        upsert: true
                    }
                };
            })
        );

        // send success message
        res.status(201).send({ 
            message: 'Certificate data inserted to the database.' 
        });

    }
    catch (error) {
        // show error logs
        console.log(error);

        // create misc/_debug folder if not exists 
        const debug_directory = 'server/misc/debug/';

        try { await access(debug_directory) } 
        catch (error) {
            if (error.code === 'ENOENT') { 
                await mkdir(debug_directory, { recursive: true }) 
            } 
            else { throw error }
        }

        // set hash as file name using its content
        const file_hash = createHash('md5').update(req.file.buffer).digest('hex');
        const file_name = `${file_hash}.pdf`;

        // write the file to the server/misc/debug directory
        await writeFile(debug_directory + file_name, req.file.buffer);
        
        // send error message
        res.status(500).send({ 
            message: 'An error occurred when extracting.', error
        });
    }
}

async function remove(req, res) {
    const id = req.params.id;

    try {
        // Find the student to get the name
        const student = await Database.Student.findOne({ student_id: id }, { first_name: 1, last_name: 1 });
        
        if (!student) {
            console.log(`No student found with id: ${id}`);
            return res.status(404).send({ message: `No student found with ID ${id}` });
        }

        // Log the student's name
        console.log(`Deleting student: ${student.first_name} ${student.last_name}`);

        // Delete the student
        await Database.Student.deleteOne({ student_id: id });

        console.log("Student successfully deleted.");
        res.status(200).send({ message: `Student ${student.first_name} ${student.last_name} with ID ${id} successfully deleted` });
    } catch (error) {
        console.error("Error fetching or deleting student:", error);
        res.status(500).send({ message: 'Error deleting student', error: error.message });
    }
}

async function getName(req, res) {
    const id = req.params.id;

    try {
        const studentName = await Database.Student.findOne({ student_id: id }, { first_name: 1, last_name: 1 });

        if (studentName) {
            res.status(200).send({ 
                first_name: studentName.first_name, 
                last_name: studentName.last_name 
            });
        } else {
            res.status(404).send({ 
                message: `Student with ID ${id} not found` 
            });
        }
    } catch (error) {
        res.status(500).send({ 
            message: 'Error fetching student name.', error 
        });
    }
}

async function getInfo(req, res) {
    const id = req.params.id;

    try {
        const projectionInfo = {
            student_id: 1,
            first_name: 1,
            last_name: 1,
            year_level: 1,
            age: 1,
            college: 1,
            curriculum: 1,
            department: 1,
            contact_no: 1
        };

        const studentInfo = await Database.Student.findOne({ student_id: id }, projectionInfo);

        if (studentInfo) {
            console.log(`Student Information for ID ${id}:`);
            console.log(`Student ID: ${studentInfo.student_id}`);
            console.log(`Name: ${studentInfo.first_name} ${studentInfo.last_name}`);
            console.log(`Year Level: ${studentInfo.year_level}`);
            console.log(`Age: ${studentInfo.age}`);
            console.log(`College: ${studentInfo.college}`);
            console.log(`Curriculum: ${studentInfo.curriculum}`);
            console.log(`Department: ${studentInfo.department}`);
            console.log(`Contact No: ${studentInfo.contact_no}`);

            res.status(200).send({
                student_id: studentInfo.student_id,
                first_name: studentInfo.first_name,
                last_name: studentInfo.last_name,
                year_level: studentInfo.year_level,
                age: studentInfo.age,
                college: studentInfo.college,
                curriculum: studentInfo.curriculum,
                department: studentInfo.department,
                contact_no: studentInfo.contact_no
            });
        } else {
            console.log(`Student with ID ${id} not found`);
            res.status(404).send({ message: `Student with ID ${id} not found` });
        }
    } catch (error) {
        console.error("Error fetching student information:", error);
        res.status(500).send({ message: 'Error fetching student information', error: error.message });
    }
}

async function putContact(req, res) {
    const id = req.params.id;
    const no = req.params.no;

    try {
        const student = await Database.Student.findOne({ student_id: id });

        if (student) {
            console.log(`Student Name: ${student.first_name} ${student.last_name}`);

            if (no) {
                await Database.Student.updateOne({ student_id: id }, { $set: { contact_no: no } });
                console.log(`Contact number updated to: ${no}`);
                res.status(200).send({ message: 'Contact number updated successfully' });
            } else {
                res.status(400).send({ message: 'Missing no in request body' });
            }
        } else {
            res.status(404).send({ message: `Student with ID ${id} not found` });
        }
    } catch (error) {
        console.error("Error fetching or updating student:", error);
        res.status(500).send({ message: 'Error fetching or updating student', error: error.message });
    }
}

async function getSchedule(req, res) {
    const id = req.params.id;

    try {
        const query = { "Students.student_id": id };
        const projection = {
            _id: 0,
            section: 1,
            start_time: 1,
            end_time: 1,
            day: 1,
            semester: 1,
            start_year: 1,
            end_year: 1,
            Course: 1,
            Instructor: 1,
            Classroom: 1
        };

        const studentSched = await Database.Schedule.find(query, projection).lean();

        if (studentSched.length > 0) {
            console.log(`Schedules for student with ID ${id}:`);
            studentSched.forEach(schedule => {
                console.log(JSON.stringify(schedule, null, 2));
            });

            res.status(200).send(studentSched); // Sending the schedule as JSON response
        } else {
            console.log(`No schedules found for student with ID ${id}`);
            res.status(404).send({ message: `No schedules found for student with ID ${id}` });
        }
    } catch (error) {
        console.error("Error fetching student schedule:", error);
        res.status(500).send({ message: 'Error fetching student schedule', error: error.message });
    }
}

const Student = { create, remove, getName, getInfo, getSchedule, putContact};
export default Student;