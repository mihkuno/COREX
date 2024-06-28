import Database from "../lib/database.js";

// Database is an object that contains the following properties:

// Database.Student
// Database.Schedule

// Connect to the database
Database.mongoose
    .connect(Database.url, {})
    .then(async () => {
        //console.log("Connected to MongoDataBase");
        //console.log(process.env.MONGOURL);

        // TODO: Create the get function here..

        //function getMyInformation(id)
        async function getStudentInformation(id) {
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
                } else {
                    console.log(`Student with ID ${id} not found`);
                }
            } catch (error) {
                console.error("Error fetching student information:", error);
            }
        }
        
        async function getStudentContact(id, newContactNumber) {
            try {
                const student = await Database.Student.findOne({ student_id: id });
        
                if (student) {
                    console.log(`Student Name: ${student.first_name} ${student.last_name}`);
        
                    if (newContactNumber) {
                        await Database.Student.updateOne({ student_id: id }, { $set: { contact_no: newContactNumber } });
                        console.log(`Contact number updated to: ${newContactNumber}`);
                    }
                } else {
                    console.log(`Student with ID ${id} not found`);
                }
            } catch (error) {
                console.error("Error fetching or updating student:", error);
            }
        }
        
        async function getStudentName(id) {
            try {
                const studentName = await Database.Student.findOne({ student_id: id }, { first_name: 1, last_name: 1 });

                if (studentName) {
                    console.log(`Student Name: ${studentName.first_name} ${studentName.last_name}`);
                } else {
                    console.log(`Student with ID ${id} not found`);
                }
            } catch (error) {
                console.error("Error fetching student:", error);
            }
        }
        
        // function getStudentSchedule(studentId) {}
        async function getStudentSchedule(id) {
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
                } else {
                    console.log(`No schedules found for student with ID ${id}`);
                }
            } catch (error) {
                console.error("Error fetching student schedule:", error);
            }
        }

        async function getStudentDelete(id) {
            try {
                // Find the student to get the name
                const student = await Database.Student.findOne({ student_id: id }, { first_name: 1, last_name: 1 });
                
                if (!student) {
                    console.log(`No student found with id: ${id}`);
                    return;
                }
        
                // Log the student's name
                console.log(`Deleting student: ${student.first_name} ${student.last_name}`);
        
                // Delete the student
                await Database.Student.deleteOne({ student_id: id });
        
                console.log("Student successfully deleted.");
            } catch (error) {
                console.error("Error fetching or deleting student:", error);
            }
        }
        
        // function getStudentClassmates(studentId) {}

        // TODO: Test the get function here..
        //await getStudentInformation("2022309477")
        //await getStudentName("2022309477")
        //await getStudentSchedule("2022309477")
        //await getStudentContact("2022309477", "099229292910")
        await getStudentDelete("2022307166")
    })
    .catch((err) => {
        console.log(err);
});



