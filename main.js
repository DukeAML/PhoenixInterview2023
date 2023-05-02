
const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/firestore');


const createGroupSchedule = require('./scheduleEndpoint');


const firebaseConfig = {
  apiKey: "AIzaSyDMAvqhnUHnw0F68ZIo930zfHJ9ea_qY0c",
  authDomain: "phoenix-interviews.firebaseapp.com",
  projectId: "phoenix-interviews",
  storageBucket: "phoenix-interviews.appspot.com",
  messagingSenderId: "751491379571",
  appId: "1:751491379571:web:554e19d967ce83a5255506"
};


const app = firebase.initializeApp(firebaseConfig);
const GROUP_CODE = 'testGroup';


//print out who is scheduled for the first shift
async function checkScheduledTenters(groupCode){
    await firebase
    .firestore()
    .collection('groups')
    .doc(groupCode)
    .get()
    .then((doc) => {
      var schedule = doc.data().groupSchedule;
      if (schedule == null){
        console.log("Error, no schedule in the database");
        return;
      } else if (schedule.length == 0){
        console.log("Error, schedule length is zero");
      } else {
        var tenters = schedule[0].split(' ')
        console.log("Users scheduled for the first shift are " + tenters[0] + " and " + tenters[1]);
      }
    })

}

//initialize the schedule in the database with bad values that need to be fixed
async function init_db(groupCode){
    await firebase
    .firestore()
    .collection('groups')
    .doc(groupCode)
    .update({
      groupSchedule: ["Wrong_Tenter1 Wrong_Tenter2", "Wrong_Tenter1 Wrong_Tenter2"]
    })
    
}

//mess up the db and print out who is scheduled for the first shift
init_db(GROUP_CODE);
console.log("Before fixing the schedule:")
checkScheduledTenters(GROUP_CODE);

//run the scheduler and print out who is scheduled afterwards
createGroupSchedule.createGroupSchedule(GROUP_CODE, "Black", 1).then(() => {
    console.log("After fixing the schedule:");
    checkScheduledTenters(GROUP_CODE);
});