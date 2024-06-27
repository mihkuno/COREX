/**
 *
 * Custom made to extract data from the Certificate of Registration (COR)
 * of the University of Science and Technology of Southern Philippines.
 *
 * It is used as a middleware in the server.js file.
 *
 */

import fs from 'fs';
import crypto from 'crypto';
import PDFParser from 'pdf2json';

// -------------------------------------------------------------------------------------------------
// Formatter
// -------------------------------------------------------------------------------------------------

// Function to create MD5 hash from a file path or buffer
async function createMD5Hash(input) {
	let fileBuffer;
 
	if (typeof input === 'string') {
	  // If the input is a file path, read the file into a buffer
	  try {
		 fileBuffer = fs.readFileSync(input);
	  } 
	  catch (error) {
		 throw new Error('Error reading file: ' + error.message);
	  }
	} 
	
	else if (Buffer.isBuffer(input)) {
	  // If the input is already a buffer, use it directly
	  fileBuffer = input;
	} 
	
	else {
	  throw new Error('Invalid input type. Please provide a file path or a buffer.');
	}
 
	// Calculate the MD5 hash of the file buffer
	return crypto.createHash('md5').update(fileBuffer).digest('hex');
 }

/**
 * Remove titles like Mr., Ms., Dr., Engr, Eng from the beginning of the name
 * @param {string} name
 * @return {string} name without title
 * @private
 */
function removeNameTitle(name) {
	return name.replace(/^(mr\.|ms\.|dr\.|engr|eng)\s+/i, '');
}

/**
 * Makes every first letter of a word in a sentence upper case
 * @param {string} phrase
 * @returns {string} title case phrase
 * @private
 */
function toTitleCase(phrase) {
	return phrase
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
		.replace(/ +/g, ' ')
		.trim();
}

/**
 * Splits the student name string into first, last, and middle name
 *	The last name is first in the array if it has a comma
 * 
 * @param {string} name the full name
 * @returns {Array<string>} splitted name
 * @private
 */
function splitNameFormat(name) {
	const title_case = toTitleCase(removeNameTitle(name));
	const split_name = title_case.split(' ');

	let last_name = '';
	let first_name = '';
	let middle_initial = '';

	// check if the last name is first in the array
	// it probably has a comma
	if (split_name[0].at(-1) == ',') {
		// shift affect the original array ang returns the first element
		last_name = split_name.shift().slice(0, -1);
	}
	// check if first name is first in the array
	else {
		// pop affects the original array
		last_name = split_name.pop();
	}

	// check if middle initial exists
	middle_initial = split_name.at(-1);

	if (middle_initial.length <= 2 || middle_initial.endsWith('.')) {
		// assign m.i, and remove period if it exists
		middle_initial = split_name.pop().charAt(0); // pop affects the original array
	} else middle_initial = null;

	first_name = split_name.join(' ');

	return [ first_name, last_name, middle_initial ];
}

/**
 * Convert a 12:00 PM time into 24:00
 * @param {string} timeString in 12 hour format
 * @returns {string} timeString in 24 hour format
 * @private
 */
function to24HourFormat(timeString) {
	const [time, period] = timeString.split(' ');
	let [hours, minutes] = time.split(':');

	hours = period === 'PM' && hours < 12 ? parseInt(hours, 10) + 12 : parseInt(hours, 10) % 12;

	return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

// -------------------------------------------------------------------------------------------------
// Extractor
// -------------------------------------------------------------------------------------------------

/**
 * Extracts text data from the first page of a PDF.
 *
 * @param {JSON} pdfData - The raw data of the PDF file.
 * @returns {Array<string>} An array of text extracted from the PDF.
 * @private
 */
const _getPdfTextArray = pdfData => {
	// select only first page text
	const pageObject = pdfData['Pages'][0]['Texts'];

	const data = []; 	   // iterate text object and append to text array
	let customIndex = 0; // index for each information in the pdf text
	
	for (const [fixedIndex, textObject] of pageObject.entries()) {

		const text = decodeURIComponent(textObject['R'][0]['T']);

		// TODO: IF THERE IS ADDRESS, CHECK IF IT OFFSETS THE INDEX
		if ( // if there is no scholarship or contact, push 'N/A' to the array
			(customIndex == 26 && text.replaceAll(' ', '') == 'Contact#:') || 
			(customIndex == 31 && text.replaceAll(' ', '') == 'UNIT')) {
			
			data.push('N/A');
			customIndex++;
		}

		data.push(text);
		customIndex++;
	}


	return data;
};

/**
 * Extracts student data from the pdf data and returns an object in json format
 *
 * @param {Array<string>} data Maps the text array to its corresponding key
 * @returns {Array<Object>} containing student and semester data
 * @private
 */
const _getStudentData = data => {
	
	if (data[0] != 'C E R T I F I C A T E  O F  R E G I S T R A T I O N') throw new Error('Not a COR');
	
	// USTP CDO CAMPUS -> CDO
	data[1] = data[1].split(' ')[1];

    // TODO: add abbreviations for other campuses
    // CDO -> Cagayan De Oro (CDO)
    if (data[1] === 'CDO') {
        data[1] = 'Cagayan De Oro (CDO)';
    }

	// CAINDAY, Jerome B. -> [Jerome, Cainday, B] 
	data[17]                = splitNameFormat(data[17]);
	const first_name        = data[17][0];
	const last_name         = data[17][1];
	const middle_initial    = data[17][2];

	// COLLEGE OF INFORMATION TECHNOLOGY AND COMPUTING 
    //    -> College Of Information Technology And Computing (CITC)
	data[20] = {
        // these are valid
		'COLLEGE OF ENGINEERING & ARCHITECTURE': 			toTitleCase(data[20]) + ' (CEA)',
		'COLLEGE OF INFORMATION TECHNOLOGY AND COMPUTING': 	toTitleCase(data[20]) + ' (CITC)',
        // TODO: check if this are the correct abbreviations
        'COLLEGE OF ENGINEERING AND ARCHITECTURE': 			toTitleCase(data[20]) + ' (CEA)',
		'COLLEGE OF INFORMATION TECHNOLOGY & COMPUTING': 	toTitleCase(data[20]) + ' (CITC)',
        'COLLEGE OF SCIENCE AND MATHEMATICS': 				toTitleCase(data[20]) + ' (CSM)',
		'COLLEGE OF SCIENCE AND TECHNOLOGY EDUCATION': 		toTitleCase(data[20]) + ' (CSTE)',
		'COLLEGE OF SCIENCE & MATHEMATICS': 				toTitleCase(data[20]) + ' (CSM)',
		'COLLEGE OF SCIENCE & TECHNOLOGY EDUCATION': 		toTitleCase(data[20]) + ' (CSTE)',
		'COLLEGE OF TECHNOLOGY': 							toTitleCase(data[20]) + ' (COT)',
		'COLLEGE OF MEDICINE': 								toTitleCase(data[20]) + ' (COM)'
	}[data[20]];
	
	
    // 1st Semester, A.Y. 2021-2022 -> 1, 2021, 2022
	data[25] 			= data[25].split(' ');
	const semester 	    = parseInt(data[25][0].charAt(0));
	data[25] 			= data[25][3].split('-');
	const start_year 	= parseInt(data[25][0]);
	const end_year 	    = parseInt(data[25][1]);

    
    // 'M' -> 'Male'
    data[18] = {
        'M': 'Male',
        'F': 'Female'
    }[data[18]];


    // '18' -> 18
    data[19] = parseInt(data[19]);


	// 2nd Year - Baccalaureate -> 2
	data[23] = parseInt(data[23].split(' ')[0].charAt(0));
	
    
    // 'N/A' -> null
	data[22] = data[22] == 'N/A' ? null : data[22];


	return {
			// index <= 31 is student data
			campus: 			data[1],
			first_name: 		first_name,
			last_name: 			last_name,
			middle_initial: 	middle_initial,
			year_level: 		data[23],
            registration_no:    data[15],
			student_id: 	    data[16],
			gender: 			data[18],
			age: 				data[19],
			college: 			data[20],
			department: 		data[21],
			major: 				data[22],
			curriculum: 		data[24],
			nationality: 		data[30],
			contact_no: 		data[31],
			semester: 			semester,
			start_year: 		start_year,
			end_year: 			end_year,
			// index >= 39 is schedules data
		};
};

/**
 * Extracts schedule data from the given text data and returns an array of objects in JSON format.
 *
 * @param {Array<string>} dataArray - An array of strings representing the text data.
 * @returns {Array<JSON>} An array of objects containing schedule data.
 * @private
 */
const _getScheduleData = (dataArray, studentData) => {
	

	const patternOfSchedule     = /(^(S|M|T|W|Th|F)*(\s\d\d?:\d\d\s(AM|PM)))\s-(\s\d\d?:\d\d\s(AM|PM))/g;
	const patternOfWeekday 	    = /^(S|M|Th|T|W|F)*/g;
	const patternOfTime 		= /\d\d?:\d\d\s(AM|PM)/g;
	const patternOfRoom 		= /(\d{2}-\d{3})/g;


	// parse the schedule string into an object
	// ============================================================================
	const _parseSchedule = scheduleString => {
		const schedule 	= scheduleString.match(patternOfSchedule)[0];
		
		let room_code 	   = scheduleString.replace(schedule, '').trim();
		let room_no 	   = null;
		let floor_no 	   = null;
		let building_no 	= null;
		
		if (room_code !== '') {
			room_code 	= room_code.match(patternOfRoom)[0].split('-');
			building_no = room_code ? parseInt(room_code[0]) 				  : null;
			floor_no 	= room_code ? parseInt(room_code[1].charAt(0)) 	  : null;
			room_no		= room_code ? parseInt(room_code[1].substring(1)) : null;
		}
		
		const mixedDays 	= schedule.match(patternOfWeekday)[0];
		const start_time 	= schedule.match(patternOfTime)[0];
		const end_time 	    = schedule.match(patternOfTime)[1];
		const weekdays 	    = [];

		for (let j = 0; j < mixedDays.length; j++) {
			// check if the current day is 'T' and the next is 'h' then push 'Th' to the array
			if (
				mixedDays[j] 	 == 'T' && 
				mixedDays[j + 1] == 'h') {
				weekdays.push('Thursday');
				j++;
				continue;
			}

			weekdays.push({
                'S': 'Saturday',
                'M': 'Monday',
                'T': 'Tuesday',
                'W': 'Wednesday',
                'F': 'Friday',
            }[mixedDays[j]]);
		}

		return { room_no, floor_no, building_no, weekdays, start_time, end_time };
	};
	// ============================================================================

	 
	 let subjectWithArrayOfSchedules = [];
	 const indexOfBreak = dataArray.indexOf('Total Unit(s)');

	 // if the index of 'Total Unit(s)' is not found, then it is not a COR
	 if (!indexOfBreak) throw new Error('Not a COR');
	 
	/**
	 * Check if we moved on to another course in the list of schedules
	 * but we overthrowed, and the current index is still a schedule.
	 *	So we add the current index to the previous course's schedule
	 */

	 for (let i = 39; i < indexOfBreak; i += 8) {

		// check if the current schedule is dependent on the previous schedule
		const isScheduleOfPreviousSchedule = dataArray[i].match(patternOfSchedule);
		
		if (isScheduleOfPreviousSchedule) {
			// schedule is dependent on the number of days
			const { room_no, floor_no, building_no, weekdays, start_time, end_time } = _parseSchedule(dataArray[i]);

			let previousSchedule = subjectWithArrayOfSchedules.at(-1);

			weekdays.forEach(day => {
				previousSchedule.schedule.push({
					day: 			day,
					room_no: 	    room_no,
					floor_no: 	    floor_no,
					building_no:    building_no,
					instructor:     dataArray[i + 1],
					start_time:     start_time,
					end_time: 	    end_time,
				});
			});

			i -= 6; // proceed to the next iteration
		} 
		
		// if not, then it is a new schedule
		else {
			// schedule is dependent on the number of days
			const { room_no, floor_no, building_no, weekdays, start_time, end_time } = _parseSchedule(dataArray[i + 5]);

			let course = {
				course_name:        dataArray[i + 1],
				lecture_units: 	    dataArray[i + 2],
				laboratory_units:   dataArray[i + 3],
				credit_units: 	    dataArray[i + 4],
				course_code: 	    dataArray[i + 6],
				section: 	        dataArray[i + 7],
				schedule: 	        [],
			};

			weekdays.forEach(day => {
				course.schedule.push({
					day: 			day,
					room_no: 	    room_no,
					floor_no: 	    floor_no,
					building_no:    building_no,
					instructor:     dataArray[i],
					start_time:     start_time,
					end_time: 	    end_time,
				});
			});

			subjectWithArrayOfSchedules.push(course);
		}
	}
	
	// ============================================================================

	let unpackSchedulesToItsSubject = [];

	subjectWithArrayOfSchedules.forEach(subj => {

		subj.schedule.forEach(sched => {
			const [first_name, last_name, middle_initial] = splitNameFormat(sched.instructor);

			const schedule = {
				Course: 			{
					course_code: 		subj.course_code,
					course_name: 		subj.course_name,
					credit_units: 		parseInt(subj.credit_units),
					lecture_units: 	    parseInt(subj.lecture_units),
					laboratory_units:   parseInt(subj.laboratory_units),
				},
				
				Instructor: 	{
					first_name: 	first_name, 
					last_name:  	last_name, 
					middle_initial: middle_initial
                },
				
				Classroom:   {
					building_no: 	sched.building_no,
					floor_no: 		sched.floor_no,
					room_no: 		sched.room_no,
				},

				section: 		    subj.section,
				start_time: 	    sched.start_time,
				end_time: 		    sched.end_time,
				day: 				sched.day,
				semester: 		    studentData.semester,
				start_year: 	    studentData.start_year,
				end_year: 		    studentData.end_year
			};

			unpackSchedulesToItsSubject.push(schedule);
		});
	});

	return unpackSchedulesToItsSubject;
};

/**
 * Extracts data of student and schedule from the Certificate of Registration.
 *	 
 * Shows the object's properties and methods without depth limit 
 * console.dir(await getCorInformation('../misc/cor2.pdf'), {depth: null})
 * 
 * @param   {string | Buffer} pdf - The file path of the Certificate of Registration in PDF format.
 * @returns {Promise<{ studentData: JSON, courseData: JSON }>} A promise that resolves with student and course data.
 * @throws  {PdfParserError} Thrown if there is an error during PDF parsing.
 * @throws  {InvalidFormatError} Thrown if the COR file is not in the correct format.
 * @throws  {Error} Thrown for any other unexpected errors.
 * @public
 * 
 */
async function getCorInformation(pdf) {
	return new Promise((resolve, reject) => {
		const pdfParser = new PDFParser();

	
		// check if its a string then its a path
		if (typeof pdf == 'string') {
			pdfParser.loadPDF(pdf);
		}
		// check if not, then its a buffer
		else {
			pdfParser.parseBuffer(pdf);
		}

		pdfParser.on('pdfParser_dataError', dataError => {
			reject({
				name: 'PdfParserError',
				message: 'An error occured when parsing the pdf file.',
			});
		});

		pdfParser.on('pdfParser_dataReady', async dataReady => {
			
			try {
				const dataArray = _getPdfTextArray(dataReady);
				const Student   = _getStudentData(dataArray);
				const Schedule  = _getScheduleData(dataArray, Student);

                // set _id of pdf as md5 hash of the file
                Student['certificate'] = await createMD5Hash(pdf);
                resolve({ Student, Schedule });
			} 
			
			catch (dataError) {
				console.log(dataError);
			
				reject({
					name: 'InvalidFormatError',
					message: 'The Certificate of Registration is not in the correct format.',
				});
			}
			
		});

	});

}

// Extractor Class-------------------------------------------------------------------------------------------------

const Extractor = { getCorInformation };
export default Extractor;
