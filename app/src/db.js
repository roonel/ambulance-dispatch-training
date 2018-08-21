import Dexie from 'dexie';

var db = new Dexie('hellodb');
db.version(1).stores({
    ambulance: '++id,status,available,name,currentPatientId',
    event: '++id,patientId,patientStatus,kivonult,elindult,atadta,ambulanceId'
});

export default db;