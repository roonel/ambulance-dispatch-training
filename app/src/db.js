import Dexie from 'dexie';

var db = new Dexie('hellodb');
db.version(1).stores({
    ambulance: '++id,available,name,currentPatientId',
    event: '++id,patientId,patientStatus,kivonult,elindult,atadta,ambulanceId'
});

db.ambulance.add({available: true, name: "MGE112"});

export default db;