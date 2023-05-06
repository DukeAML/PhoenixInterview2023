const firebase = require("firebase/compat/app");
require("firebase/compat/auth");
require("firebase/compat/firestore");
const data = require("./data/gracePeriods.json");
const Person = require("./Scheduling/person");
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
async function createGroupSchedule(groupCode, tentType, weekNum) {
  var people = new Array();
  var scheduleGrid = new Array();
  var idToName = {};
  idToName["empty"] = "empty";
  idToName["Grace"] = "Grace";
  await firebase
    .firestore()
    .collection("groups")
    .doc(groupCode)
    .collection("members")
    .get()
    .then((collSnap) => {
      collSnap.forEach((doc) => {
        // !!! add new key value pairs to idToName using doc responses

        // !!! make slot objects out of all of these availabilities
        // !!! use fields from the each to doc to get slots
        var user_slots = Helpers.availabilitiesToSlots(
          null,
          null,
          null,
          null
        );

        scheduleGrid.push(user_slots);
        
        // !!! fill in the null values (using the products of previous steps)
        var [numFreeDaySlots, numFreeNightSlots] = Helpers.dayNightFree(
          null
        );
        
        var person = new Person(
          null,
          null,
          numFreeDaySlots,
          numFreeNightSlots,
          0,
          0
        );
        people.push(person);
      });
    });

  // !!! leaving something like this function call as text suggesting what to do is good, needs to be clear
  var slot_info = Algorithm.schedule(null, null, null);

  // now need to get an array of strings to push to the db
  var groupScheduleArr = [];

  // !!! iterate through slot_info and use it to create an array groupScheduleArr of strings made up of space delimited concatenatation of all the names in each slot

  // !!! For Interviewers: have them explain what is happening in the program here
  await firebase.firestore().collection("groups").doc(groupCode).update({
    groupSchedule: null,
  });

  return groupScheduleArr;
}
module.exports = { createGroupSchedule };
