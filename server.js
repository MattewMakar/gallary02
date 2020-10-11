//===============================================================================
//If no port defined setting the port to 300
//===============================================================================
const HTTP_PORT = process.env.port || 3000;

//===============================================================================
/*Imprting necessry modules  
( express , path  , bodyParser , handlebars , express-handlebars , readLine)*/
//===============================================================================
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars');
const readLine = require('linebyline');

//===============================================================================
//instantiating express and linebyline modules  
//===============================================================================
const app = express();
const rl = readLine("./public/imagelist.txt");


//===============================================================================
//Setting the handle bars engine 
//===============================================================================
app.engine('hbs', exphbs(
  { extname: 'hbs', defaultLayout: false, layoutsDir: __dirname + '/views' })
);

//===============================================================================
//define the dir for the stating files and using the bodyparser methods 
//===============================================================================
app.use('/', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//===============================================================================
//configring the views dir and configring the template engine 
//===============================================================================
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");


//===============================================================================
//Reading the text file and setting the data object
//===============================================================================
const nameList = [];
rl.on("line", (l, lCount, bCount) => {
  nameList.push(l);
}).on("error", (err) => { console.error(err) });
 
let m_data = {
  list: nameList,
  focus: "Gallery"
};

//===============================================================================
/*Setting up handlebars helper to handle if the request value is null 
the descreption will be set to empty string */
//===============================================================================
Handlebars.registerHelper("checkImage", () => {
  if (m_data.focus === "No Image")
    return "";
  else
    return m_data.focus;
});
//===============================================================================
//GET method with any url will lead to the landing page
//===============================================================================
app.get('*', (req, res) => {
  m_data.focus = "Gallery";
  res.render('index', {data : m_data});
});


//===============================================================================
//POST method handling with the sent value of the radio button 
//===============================================================================
app.post('/', (req, res) => {
  if (!req.body.imageInput)
    m_data.focus = "No Image";
  else
    m_data.focus = req.body.imageInput;
  res.render('index', { data: m_data });
})


//===============================================================================
//The app is listening to requests at the HTTP PORT
//===============================================================================
app.listen(HTTP_PORT, () => {
  console.log('server starting at ', HTTP_PORT);
}); 