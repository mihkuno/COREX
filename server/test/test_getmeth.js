import Database from "../lib/database.js";

// Database is an object that contains the following properties:

// Database.Student
// Database.Schedule

// Connect to the database
Database.mongoose
    .connect(Database.url, {})
    .then(async () => {
        console.log("Connected to MongoDataBase");
        console.log(process.env.MONGOURL);

        // TODO: Create the get function here..
        // function getStudentName(studentId) {}
        // function getStudentSchedule(studentId) {}
        // function getStudentClassmates(studentId) {}

        // TODO: Test the get function here..
        // getStudentName("2022309477")
    })
    .catch((err) => {
        console.log(err);
});



