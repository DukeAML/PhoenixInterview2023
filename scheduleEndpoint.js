const firebase = require('firebase/compat/app');
require('firebase/compat/auth');
require('firebase/compat/firestore');
const data = require('./data/gracePeriods.json');
const Person = require('./Scheduling/person');
const Helpers = require("./Scheduling/helpers");
const Algorithm = require("./Scheduling/algorithm");

let GRACE;
const MAXBLOCK = 8; //max half hours minus one (not including current time block) person can be scheduled for



/**
 * Tent shift scheduling. Also updates the database with the new schedule it produces. 
 * @param {*} groupCode  (string) that identifies the group in the database
 * @param {*} tentType (string) like "Blue", "Black", or "White". It gets set to "White" if it is not "Black" or "Blue"
 * @param {*} weekNum (int) represents which weekNum it is, e.g. 1, 2, 3, or 4
 * @returns groupScheduleArr, an array of 336 strings (1 for each 30 minute shift in a weekNum), 
 *    where each string is like "Alvin Keith Nick", representing the people in the tent at that time. 
 */
async function createGroupSchedule(groupCode, tentType, weekNum){
  var people = new Array();
  var scheduleGrid = new Array();
  var idToName = {};
  idToName['empty'] = 'empty';
  idToName['Grace'] = 'Grace';
  await firebase
    .firestore()
    .collection('groups') 
    .doc(groupCode)
    .collection('members')
    .get()
    .then((collSnap) => {
      collSnap.forEach((doc) => {
        var name = doc.data().name;
        var id = doc.id;
        idToName[id] = name;
        var availability = doc.data().availability; //array of boolean values indicating availability
        
        // make slot objects out of all of these availabilities
        var user_slots = Helpers.availabilitiesToSlots(id, availability, tentType, people.length)
        scheduleGrid.push(user_slots); 


        var [numFreeDaySlots, numFreeNightSlots] = Helpers.dayNightFree(availability);

        var person = new Person(id, name, numFreeDaySlots, numFreeNightSlots, 0, 0);
        people.push(person);
      });
    });


  var slot_info = Algorithm.schedule(people, scheduleGrid, weekNum);
 
  
  //now need to get an array of strings to push to the db
  var groupScheduleArr = [];
  for (var i = 0; i < slot_info.length; i++){
    var ids = slot_info[i].ids;
    var names = "";
    for (var j = 0; j < ids.length; j++){
      names = names + idToName[ids[j]] + " ";
    }
    if (names.endsWith(" ")){
      names = names.substring(0, names.length -1);
    }
    groupScheduleArr.push(names);
  }

  //push new schedule to the db
  await firebase
  .firestore()
  .collection('groups')
  .doc(groupCode)
  .update({
    groupSchedule: groupScheduleArr
  })

  return groupScheduleArr;



}
module.exports = {createGroupSchedule};



