//===============================================================================
//If no port defined setting the port to 300
//===============================================================================
const HTTP_PORT = process.env.PORT || 3000;

//===============================================================================
/*Imprting necessry modules  
( express , path  , bodyParser , client sessions , express-handlebars 
  random string ,fs,  readLine)*/
//===============================================================================
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const readLine = require('linebyline');
const session = require('client-sessions');
const randomStr = require('randomstring');	
const fs = require('fs');
//===============================================================================
//setting the file pathname for line by line module and instantiate express
//===============================================================================

const app = express();
const rl = readLine("./public/imagelist.txt");


//===============================================================================
//setting up the session name and duration 
//===============================================================================
const random = randomStr.generate();//generating random string


app.use(session(
  {
    cookieName: "logged",
    secret: random,
    duration: 5 * 60 * 1000,
    activeDuration: 1 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
  }
)
);

//===============================================================================
//Setting the handlebars engine 
//===============================================================================
app.engine('hbs', exphbs(
  { extname: 'hbs', defaultLayout: false, layoutsDir: __dirname + '/views' })
);

//===============================================================================
//define the dir for the static files and using the bodyparser methods 
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
  focus: "Gallery",
  user:""
};

//===============================================================================
//GET method with any url will lead to the landing page
//===============================================================================

//-----------------------------THE WEB APP URL-----------------------------------

app.get('/', (req, res) => {
  req.logged.user = "";
  req.logged.reset();
  res.render('logIn');
});
//-----------------------------GET /REGISTER -----------------------------------
app.get('/register', (req, res) => {
 
  res.render('Reg');

})
//-----------------------------URL GALARY ENTERED--------------------------------
app.get('/gallery', (req, res) => {
  if (req.logged.user)
  {
    m_data.focus = "Gallery";
    res.render('index', { data: m_data });
  } else
    res.render('logIn');

 })

//===============================================================================
//POST method handling with the sent value of the radio button 
//===============================================================================

//-------------------------------REGISTER BUTTON---------------------------------

app.post('/register', (req, res) => {
  let reg = {};

  let d = JSON.parse(fs.readFileSync('./user.json', 'utf-8', (err) => { console.log(err); }));
  if (!req.body.userName || !req.body.password || !req.body.confirmPassword)
  {
    reg.msg = "Please enter username, password and confirm password";
    reg.user = req.body.userName ;
    reg.pass = req.body.password;
    reg.Cpass = req.body.confirmPassword;

  }else if(d[req.body.userName.toLowerCase()])
  { 
    reg.msg = " Duplicate username "; 
    reg.user = req.body.userName; 
    reg.pass = req.body.password;
    reg.Cpass = req.body.confirmPassword;

  }else if (req.body.password.length < 8)
  {
    reg.msg = "Passwords must be at lease 8 characters";
    reg.user = req.body.userName;    
    reg.pass = req.body.password; 
    reg.Cpass = req.body.confirmPassword;

  }else if (req.body.password != req.body.confirmPassword)
  {
    reg.msg = " Passwords do not match ";
    reg.user = req.body.userName ;
    reg.pass = req.body.password;
    reg.Cpass = req.body.confirmPassword;

  }else if (d[req.body.userName.toLowerCase()] = req.body.password)
  {
    reg.msg = "User regisesterd successfully ";
    reg.user = "" ;
    reg.pass = "";
    reg.Cpass = "";

    fs.writeFile('user.json', JSON.stringify(d, null, 4), err => {
      if (err) throw err;
    });
  }
  res.render('Reg', { data: reg });

})
//---------------------------------SUBMIT BUTTON---------------------------------
app.post('/gallery', (req, res) => {
  if (req.logged.user) {
    if (!req.body.imageInput)
      m_data.focus = "Gallery";
    else
      m_data.focus = req.body.imageInput;
    res.render('index', { data: m_data });
  } else
    res.render('logIn');
});
//---------------------------------LOGIN BUTTON---------------------------------
app.post('/', (req, res) => {
  fs.readFile('./user.json', 'utf-8', (err, d) => {
    let msg = "";
    d = JSON.parse(d);
    
    if (d[req.body.userName.toLowerCase()] === req.body.password) {
     req.logged.user = m_data.user = req.body.userName.toLowerCase();
      res.render('index', { data: m_data });
    }
    else if (!d[req.body.userName.toLowerCase()]) {
      msg = 'Not a registered username';
      res.render('logIn', { message: msg });
    } else if (d[req.body.userName.toLowerCase()] != req.body.password) {
      msg = 'Invalid password';
      res.render('logIn', { message: msg });
    }
  });
})
//===============================================================================
//The app is listening to requests at the HTTP PORT
//===============================================================================
app.listen(HTTP_PORT, () => {
  console.log('server starting at ', HTTP_PORT);
}); 