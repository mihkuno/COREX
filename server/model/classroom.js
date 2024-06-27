export default function Classroom(mongoose) {

    // Schema
    const schema = _schema(mongoose);
  
    // Model
    const Classroom = mongoose.model("Classroom", schema);
  
    // Model functions
    // ...

    return Classroom;
};


function _schema(mongoose){
    return mongoose.Schema({
        
        building_no:            { type: Number, min: 0, max: 100 },
        building_name:          { type: String, maxlength: 100 },
        building_description:   { type: String, maxlength: 500 },
        longitude:              { type: Number, min: -180, max: 180 },
        latitude:               { type: Number, min: -90, max: 90},

        Rooms: [{
            floor_no:           { type: Number, min: 0, max: 50 },
            room_no:            { type: Number, min: 0, max: 100 },
            room_name:          { type: String, maxlength: 100 },
            room_description:   { type: String, maxlength: 500 },
        }]
    }, 
    
    { versionKey: false, timestamps: true });
}


  