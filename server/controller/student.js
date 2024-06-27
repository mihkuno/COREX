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



const Student = { create };
export default Student;