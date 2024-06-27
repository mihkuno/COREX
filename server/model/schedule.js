export default function Schedule(mongoose) {

    // Schema
    const schema = _schema(mongoose);
  
    // Model
    const Schedule = mongoose.model("Schedule", schema);
  
    // Model functions
    // ...

    return Schedule;
};


function _schema(mongoose){

    const time_regex = /^(1[0-2]|0?[1-9]):[0-5][0-9] [AP]M$/; // HH:MM AM/PM
    const days_enum = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return mongoose.Schema({
        
        section:                { required: true, type: String, maxLength: 50 },
        start_time:             { required: true, type: String, match: time_regex },
        end_time:               { required: true, type: String, match: time_regex },
        day:                    { required: true, type: String, enum: days_enum  },
        semester:               { required: true, type: Number, min: 1, max: 2 },
        start_year:             { required: true, type: Number, min: 2023, max: 2100 },
        end_year:               { required: true, type: Number, min: 2023, max: 2100 },

        Course: {
            _id: false,
            course_code:        { required: true, type: String, maxLength: 10 },
            course_name:        { required: true, type: String, maxLength: 100 },
            credit_units:       { required: true, type: Number, min: 0, max: 10 },
            lecture_units:      { required: true, type: Number, min: 0, max: 10 },
            laboratory_units:   { required: true, type: Number, min: 0, max: 10 },
        },

        Instructor: {
            _id: false,
            first_name:         { required: true, type: String, maxLength: 50 },
            last_name:          { required: true, type: String, maxLength: 50 },
            middle_initial:     { type: String, maxLength: 2 }, 
        },

        Classroom: {
            _id: false,
            building_no:        { type: Number, min: 0, max: 100 },
            floor_no:           { type: Number, min: 0, max: 50 },
            room_no:            { type: Number, min: 0, max: 100 },
        },

        Students: [{
            _id: false,
            first_name:         { required: true, type: String, maxLength: 50 },
            last_name:          { required: true, type: String, maxLength: 50 },
            student_id:         { required: true, type: String, maxLength: 10 },
            certificate:        { required: true, type: String, length: 32 },
        }]

        
    }, 
    
    { versionKey: false, timestamps: true });
}


  