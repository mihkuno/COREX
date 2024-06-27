import { extname } from 'path';
import { createHash } from 'crypto';
import { access, mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import Database from './database.js';
import Extractor from './extractor.js';

import { OAuth2Client } from 'google-auth-library';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const Student = {
	upload_certificate_of_registration: async function (req, res) {
		const file_buffer = req.file.buffer;

		const debug_directory = __dirname + '/../misc/DEBUG/';
		const dump_directory = __dirname + '/../misc/DUMP/';

		/**
		 * Verify that the file extension is a PDF
		 *
		 */

		// Get the file extension from the original file_name
		const file_extension = extname(req.file.originalname).toLowerCase();

		// If the file extension is not a PDF, save to dump then return an error
		if (file_extension !== '.pdf') {
			// save to dump folder
			try {
				// Check if the directory exists, if not, create it
				await access(dump_directory);
			} 
			catch (error) {
				if (error.code === 'ENOENT') {
					await mkdir(dump_directory, { recursive: true });
				} else {
					throw error;
				}
			}

			// Save the file to the 'DUMP/' directory
			await writeFile(dump_directory + file_name, file_buffer);

			return res.status(400).send('Only PDF files are allowed.');
		}

		/**
		 * Set hash as file name using its content
		 *
		 */

		const file_hash = createHash('md5').update(file_buffer).digest('hex');
		const file_name = `${file_hash}.${file_extension}`;

		/**
		 * Check if pdf hash is already in the database
		 *
		 */

		if ((await Database.findCertificate(file_hash)).length > 0) {
			return res.status(409).send({ error: 'This Certificate Of Registration already exists!' });
		}

		/**
		 * Extract information from its buffer, then insert it to the database
		 *
		 */

		try {
			const { fileData, studentData, scheduleData } = await Extractor.getCorInformation(file_buffer);

			const email_name = req.account.name;
			const email_address = req.account.email;

			// insert ignore the department and college
			await Database.createDepartment({
				name: 	studentData.department,
				college: studentData.college,
			});	

			// update / insert the student
			await Database.upsertStudent({
				first_name: 		studentData.first_name,
				last_name: 			studentData.last_name,
				middle_initial: 	studentData.middle_initial,
				year_level: 		studentData.year_level,
				id:					studentData.id,
				gender:				studentData.gender,
				age: 					studentData.age,
				college:				studentData.college,
				department:			studentData.department,
				major:				studentData.major,
				email_name:			email_name,
				email_address:		email_address,
				nationality:		studentData.nationality,
				contact_no:			studentData.contact_no
			});
			
			// insert the certificate
			await Database.createCertificate({
				no: 			studentData.registration_no,
				file_name: 	fileData.hash,
				student_id: studentData.id
			}); 
			

			for (let object of scheduleData) {
				const { 
					Course, 
					Instructor, 
					Room, 
					section, 
					start_time, 
					end_time, 
					day, 
					semester, 
					start_year,
					end_year
				} = object;

				await Database.createInstructor({
					first_name: 	 Instructor.first_name, 
					last_name:  	 Instructor.last_name, 
					middle_initial: Instructor.middle_initial
				});

				await Database.createCourse({
					code: 				Course.code, 
					title: 				Course.title, 
					credit_units: 		Course.credit_units, 
					lecture_units: 	Course.lecture_units, 
					laboratory_units: Course.laboratory_units
				});


				if (Room.building_no !== null) {
					// insert ignore the building
					await Database.createBuilding({
						campus: studentData.campus,
						no: 	  Room.building_no,
					});	
				}

				if (Room.room_no !== null && Room.floor_no !== null && Room.building_no !== null) {
					// insert ignore the room
					await Database.createRoom({
						no: 				Room.room_no,
						floor_no: 		Room.floor_no,
						building_no: 	Room.building_no
					});
				}
							
				const schedule_id = await Database.createSchedule({
					course_code: 		Course.code,
					instructor_fname: Instructor.first_name,
					instructor_lname: Instructor.last_name,
					building_no: 		Room.building_no,
					room_no: 			Room.room_no,
					floor_no: 			Room.floor_no,
					section: 			section, 
					start_time: 		start_time,
					end_time: 			end_time,
					day: 					day,
					semester: 			semester,
					start_year: 		start_year,
					end_year: 			end_year
				});

				await Database.createStudentSchedule(studentData.id, schedule_id);
			}

			res.send('File uploaded successfully!');
		}
		catch (error) {
			console.log(error);
			
			// check if /DEBUG directory exists, if not, create it
			try {
				await access(debug_directory);
			} 
			catch (error) {
				if (error.code === 'ENOENT') {
					await mkdir(debug_directory, { recursive: true });
				} else {
					throw error;
				}
			}

			// write the file to the /DEBUG directory
			await writeFile(debug_directory + file_name, file_buffer);

			console.log(error);

			res.status(500).send('Error uploading file.');
		}
	},
};

// Google OAuth2 client ID
const CLIENT_ID = '89255587017-7rk09mkvbs1630in8u0n8jlsip4q5l6k.apps.googleusercontent.com';

export const Google = {
	// Middleware to authenticate the Google token provided in the request header
	// and retrieve the user information from the token payload

	authenticate: async (req, res, next) => {
		const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

		if (!token) {
			return res.status(400).json({ error: 'Token not provided' });
		}

		const client = new OAuth2Client(CLIENT_ID);

		try {
			const ticket = await client.verifyIdToken({
				idToken: token,
				audience: CLIENT_ID,
			});

			const payload = ticket.getPayload();
			// Here, you can access user information from the decoded token payload
			// For example, you can use payload.sub to get the user ID

			req.account = payload; // Attach the user information to the response object
			next(); // Call the next middleware or route handler
		} 
		catch (error) {
			console.error('Error verifying token:', error.message);
			return res.status(401).json({ error: 'Invalid token' });
		}
	},
};

export const Account = {
	// Route handler to authenticate the user and send the user information

	authenticate: (req, res) => res.status(200).send(req.account),

	session: async (req, res) => {
		// get user data from the database using req.account
		const email = req.account.email;

		const data = await Database.findStudentByEmail(email);

		if (data.length === 0) {
			return res.status(404).send({ error: 'User not found' });
		} 
		else {
			res.status(200).send(data[0]);
		}
	},
};
