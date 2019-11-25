// naphattharawat@gmail.com
const fse = require('fs-extra');
const { Reader } = require('@tanjaae/thaismartcardreader')
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const myReader = new Reader()
let kioskId;
let urlAPI;
let token;

fse.readJson('./config.json')
  .then(json => {
    kioskId = json.kioskId;
    urlAPI = json.urlAPI;
    token = json.token;
    console.log(urlAPI);



    process.on('unhandledRejection', (reason) => {
      console.log('From Global Rejection -> Reason: ' + reason);
    });

    console.log('Waiting For Device !')
    myReader.on('device-activated', async (event) => {
      console.log('Device-Activated')
      console.log(event.name)
      console.log('=============================================')
    })

    myReader.on('error', async (err) => {
      console.log(err)
    })

    myReader.on('image-reading', (percent) => {
      console.log(percent)
    })

    myReader.on('card-removed', (err) => {
      var data = null;
      var xhr = new XMLHttpRequest();
      var data = `token=${token}&kioskId=${kioskId}`;
      xhr.withCredentials = true;
      xhr.open("DELETE", `${urlAPI}/kiosk/profile`);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.send(data);
      console.log('== card remove ==')
    })

    myReader.on('card-inserted', async (person) => {
      console.log(person);
      const cid = await person.getCid()
      const thName = await person.getNameTH()
      const dob = await person.getDoB()
      console.log(`CitizenID: ${cid}`)
      console.log(`THName: ${thName.prefix} ${thName.firstname} ${thName.lastname}`)
      console.log(`DOB: ${dob.day}/${dob.month}/${dob.year}`)
      console.log('=============================================')

      var xhr = new XMLHttpRequest();
      var data = `token=${token}&kioskId=${kioskId}`;
      data += `&cid=${cid}`;
      data += `&title=${thName.prefix}`;
      data += `&fname=${thName.firstname}`;
      data += `&lname=${thName.lastname}`;
      data += `&birthDate=${dob.day}/${dob.month}/${dob.year}`;
      xhr.withCredentials = true;


      // xhr.addEventListener("readystatechange", function () {
      //   if (this.readyState === 4) {
      //     console.log(this.responseText);
      //   }
      // });

      xhr.open("POST", `${urlAPI}/kiosk/profile`);
      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      xhr.setRequestHeader("cache-control", "no-cache");
      xhr.setRequestHeader("Postman-Token", "6e874932-931e-4dd6-9ae2-c6788825d247");
      xhr.send(data);
    })

    myReader.on('device-deactivated', () => { console.log('device-deactivated') })


  }).catch(err => {
    console.log(err);
  })
