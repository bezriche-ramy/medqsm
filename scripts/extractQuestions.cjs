const fs = require('fs');
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('public/livre des profs cardio final.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text.substring(0, 3000));
}).catch(function(error) {
    console.error("Error reading PDF:", error);
});
