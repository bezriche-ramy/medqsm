import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const dataBuffer = fs.readFileSync('public/livre des profs cardio final.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text.substring(0, 3000));
}).catch(function(error) {
    console.error("Error reading PDF:", error);
});
