import Extractor from '../lib/extractor.js';

Extractor.getCorInformation('../misc/corinv.pdf')
	.then(({ fileData, studentData, scheduleData }) => {
		console.log(fileData);
		console.log(studentData);
		console.log(scheduleData);
	})
	.catch(error => {
		console.log(error);
	});
