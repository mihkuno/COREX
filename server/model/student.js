export default function Student(mongoose) {

    // Schema
    const schema = _schema(mongoose);
  
    // Model
    const Student = mongoose.model("Student", schema);
  
    // Model functions
    // ...

    return Student;
};


function _schema(mongoose){

    const gmail_regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    return mongoose.Schema({
        
        // TODO: replace when auth is added
        // email_name:             { required: true, type: String, maxLength: 50 },
        // email_address:          { required: true, type: String, match: gmail_regex },

        campus:                 { required: true, type: String, maxLength: 50 },
        first_name:             { required: true, type: String, maxLength: 50 },
        last_name:              { required: true, type: String, maxLength: 50 },
        middle_initial:         { type: String, maxLength: 2},
        year_level:             { required: true, type: Number, min: 1, max: 10 },
        student_id:             { required: true, type: String, maxLength: 10 },
        gender:                 { required: true, type: String, enum: ['Male', 'Female']},
        age:                    { required: true, type: Number, min: 15, max: 100 },
        college:                { required: true, type: String, maxLength: 100 },
        department:             { required: true, type: String, maxLength: 50 },
        major:                  { type: String, maxLength: 50 },
        curriculum:             { required: true, type: String, maxLength: 50 },
        nationality:            { required: true, type: String, maxLength: 50 },
        contact_no:             { type: String, maxLength: 10 },
        semester:               { required: true, type: Number, min: 1, max: 2 },
        start_year:             { required: true, type: Number, min: 2023, max: 2100 },
        end_year:               { required: true, type: Number, min: 2023, max: 2100 },
        registration_no:        { required: true, type: String, maxLength: 10 },
        certificate:            { required: true, type: String, length: 32 },
        
        Survey: {
            question:           { type: String, maxLength: 300 },
            response:           { type: String, maxLength: 1000 },
        },

        created_at:            { type: Date, default: Date.now },

    }, { versionKey: false });
}


  