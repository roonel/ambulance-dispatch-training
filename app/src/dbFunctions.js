import db from './db';
import Dexie from 'dexie';

let all = Dexie.Promise.all;

let dbFunctions = {
    all: all,
    getAmbulances: function(callback) {
        db.ambulance.toCollection().toArray(function (ambulances) {
            // Query related properties:
            let patientPromisies = ambulances.map(function (ambu) {
                return db.event.where('id').anyOf(ambu.currentPatientId || []).toArray();
            });

            // Await genres and albums queries:
            return all(patientPromisies).then(function (promises) {

                // Now we have all foreign keys resolved and
                // we can put the results onto the ambulances array
                // before returning it:
                ambulances.forEach(function (ambu, i) {
                    ambu.patient = promises[i][0];
                });
                return ambulances;
            });
        }).then(x => {
            callback(x);
        });
    },
    getEvents: function(callback){
        db.event.toCollection().toArray(function (events){
            let ambulancePromises = events.map(function(event){
                return db.ambulance.where('id').anyOf(event.ambulanceId || []).toArray();
            });

            return all(ambulancePromises).then(function(promises){
                events.forEach(function(ev,i){
                    ev.ambulance = promises[i][0];
                });
                return events;
            })
        }).then(x => {
            callback(x);
        });
    }
};
export default dbFunctions;