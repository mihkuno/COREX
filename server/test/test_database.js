
// models
import Database from "../lib/database.js";
import Extractor from '../lib/extractor.js';

// environment variables
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: __dirname + '/../.env' });




Database.mongoose
    .connect(Database.url, {
        // useCreateIndex: true,
        // useFindAndModify: false,
    })
    .then(async () => {
        console.log("Connected to " + Database.url);


        Extractor.getCorInformation('./server/misc/corinv.pdf')
        .then(async ({ Student, Schedule }) => {
            /**
             * TODO: Replace this with Google Token ID
             */

            Student.email_address   = 'joxladsf@gmail.com';
            Student.email_name      = 'Joeninyo Cainday';

            
            // create student
            try {                
                const isCertificateExist = await Database.Student.findOne(
                    { certificate_signature: Student.certificate_signature });

                if (!isCertificateExist) {       
                    Student = await Database.Student(Student).save();
                    console.log('Created Student');
                }
                else {
                    Student = isCertificateExist;
                    console.log('Student already exists');
                }

                // reference of the student in schedule collection
                const StudentReference = { 
                    _id:            Student._id,
                    first_name:     Student.first_name, 
                    middle_initial: Student.middle_initial, 
                    last_name:      Student.last_name, 
                    student_id:     Student.student_id, 
                };


                let i;
                for (i = 0; i < Schedule.length; i++) {

                    const isScheduleExist = await Database.Schedule.findOne({
                        section:        Schedule[i].section,
                        start_time:     Schedule[i].start_time,
                        end_time:       Schedule[i].end_time,
                        day:            Schedule[i].day,
                        semester:       Schedule[i].semester,
                        start_year:     Schedule[i].start_year,
                        end_year:       Schedule[i].end_year,
                        Course:         { ...Schedule[i].Course }, 
                        Instructor:     { ...Schedule[i].Instructor }, 
                        Classroom:      { ...Schedule[i].Classroom }, 
                    });

                    if (!isScheduleExist) {
                        console.log('Schedule does not exist');

                        // add as the first student in the schedule
                        Schedule[i].Students = [StudentReference];
                        
                        // create the schedule
                        await Database.Schedule(Schedule[i]).save();
                    }

                    else {
                        console.log('Schedule already exists');
                        
                        // get the id of the schedule, 
                        Schedule[i] = isScheduleExist;

                        // and student add to the array of the schedule
                        await Database.Schedule.updateOne(
                            { _id: Schedule[i]._id }, // push if not exists                 
                            { $addToSet: { Students: StudentReference } }   
                        );
                    }
                }

            }
            catch (error) {
                console.log(error);
            }

        })
        .catch(error => {throw 'Database insertion error has occured' + error});

    })
    .catch((err) => {
        console.log(err);
});



