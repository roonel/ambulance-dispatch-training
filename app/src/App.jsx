import React, {Component} from 'react'
import db from './db';
import dbFunctions from './dbFunctions';
import PropTypes from 'prop-types';
import EditPopup from './components/EditPopup';
import EditSelectPopup from './components/EditSelectPopup';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from "@material-ui/core/Paper";
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import moment from 'moment';
import LockIcon from '@material-ui/icons/LockOutlined';
import LockOpenIcon from '@material-ui/icons/LockOpenOutlined';

function TabContainer(props) {
    return (
        <Typography component="div" style={{padding: 8 * 3}}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};
const dateStyle = "MM.DD. HH:mm:ss";
const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    card: {
        minWidth: 200,
    },
    title: {
        marginBottom: 16,
        fontSize: 14,
    },
    table: {
        minWidth: 700,
        fontSize: '1rem'
    },
    mainBody: {
        paddingTop: 50,
    },
    button: {
        margin: theme.spacing.unit,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    red: {
        backgroundColor: 'red'
    },
    yellow: {
        backgroundColor: 'yellow'
    },
    green: {
        backgroundColor: 'lightGreen'
    },
    blue: {
        backgroundColor: 'blue'
    },
    rightIcon: {
        marginLeft: theme.spacing.unit,
    },
    pointer: {
        cursor: 'pointer'
    }
});

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {ambulances: [], events: [], tabState: 0};
        this.addAmbulance = this.addAmbulance.bind(this);
        this.refreshAmbulance = this.refreshAmbulance.bind(this);
        this.refreshEvents = this.refreshEvents.bind(this);
        this.refreshAmbulance();
    }

    moveStatus(ambu){
        let promises = [];
        switch (ambu.status){
            case 0:
                promises.push(db.event.add({kivonult:moment().format(dateStyle),ambulanceId:ambu.id}).then(x => {
                    db.ambulance.update(ambu.id,{status: ambu.status+1, currentPatientId: x});
                }));
                break;
            case 1:
                promises.push( db.ambulance.update(ambu.id,{status: ambu.status+1}));
                promises.push( db.event.update(ambu.currentPatientId,{elindult:moment().format(dateStyle)}));
                break;
            case 2:
                promises.push( db.event.update(ambu.currentPatientId,{atadta:moment().format(dateStyle)}));
                promises.push( db.ambulance.update(ambu.id,{status: 0, currentPatientId: undefined}));
                break;
        }
        dbFunctions.all(promises).then(x => {
            this.refreshAmbulance();
        })
    }

    changeTab = (event, value) => {
        if (value === 0) {
            this.refreshAmbulance();
        } else if (value === 1) {
            this.refreshEvents();
        }

        this.setState({tabState: value});
    };

    refreshAmbulance() {
        dbFunctions.getAmbulances(a => this.setState({ambulances: a}));
    }

    refreshEvents() {
        dbFunctions.getEvents(e => this.setState({events: e}));
    }

    addAmbulance(plate) {
        db.ambulance.add({available: true, name: plate, status: 0}).then(() => this.refreshAmbulance());
    }

    savePatient(id, column, data) {
        let modify = {};
        modify[column] = data;
        db.event.update(id,modify).then(x => {
            if(this.state.tabState === 0){
                this.refreshAmbulance();
            }else{
                this.refreshEvents();
            }
        });
    }

    getClassName(status, available) {
        if (!available) {
            return "blue"
        }

        switch (status) {
            case 0:
                return "green";
            case 1:
                return "red";
            case 2:
                return "yellow";
        }
    }

    changeLock(id, state){
        db.ambulance.update(id,{available:state}).then(x=> this.refreshAmbulance());
    }

    render() {

        const {classes} = this.props;
        const steps = ["Vegzett / Szabad", "Kivonul / Ellat", "Uton beteggel"];
        const selectValues = ["T1","T2","T3","SZM"];
        return (
            <div className={classes.root}>
                <AppBar color="default" className={classes.appBar}>
                    <Tabs
                        value={this.state.tabState}
                        onChange={this.changeTab}
                        indicatorColor="primary"
                        textColor="primary"
                        centered>
                        <Tab label="Ambulances"/>
                        <Tab label="Events"/>
                    </Tabs>
                </AppBar>
                <div className={classes.mainBody}>
                    {this.state.tabState === 0 && <TabContainer>
                        <Grid container spacing={24} justify="center">
                            {
                                this.state.ambulances.map((ambu, i) =>
                                    <Grid item key={ambu.id}>
                                        <Card
                                            className={classes[this.getClassName(ambu.status, ambu.available)]}>
                                            <CardContent>
                                                <Typography variant="headline" component="h2">
                                                    {ambu.name}
                                                </Typography>
                                                <Typography align="center">
                                                    {ambu.available ? steps[ambu.status] : "Nem riaszthato"}
                                                </Typography>
                                            </CardContent>
                                            <CardContent style={{paddingBottom:0, minHeight: 37}}>
                                                {ambu.patient &&
                                                <div style={{display: 'flex',justifyContent: "space-around"}}>
                                                        <EditPopup title="Edit patient id" label="Patient id"
                                                                   buttonLabel="Save" default="ID"
                                                                   originalValue={ambu.patient.patientId}
                                                                   onAccept={(value) => this.savePatient(ambu.currentPatientId, 'patientId', value)}
                                                                   type="fixed" style={{float:'left'}}/>

                                                        <EditSelectPopup title="Edit patient status" label="Patient status"
                                                            buttonLabel="Save" default="Status"
                                                            originalValue={ambu.patient.patientStatus}
                                                            selectValues={selectValues}
                                                            onAccept={(value) => this.savePatient(ambu.currentPatientId, 'patientStatus', value)}
                                                            type="fixed" style={{float:'right'}}/>
                                                </div>
                                                }
                                            </CardContent>
                                            <CardActions>
                                                {ambu.available ?
                                                    <div>
                                                        {ambu.status === 0 ?
                                                            <LockOpenIcon className={classes.pointer} onClick={() => this.changeLock(ambu.id, false)}/>
                                                            :
                                                            <LockOpenIcon color="disabled"/>
                                                        }
                                                    </div>
                                                    :
                                                    <LockIcon className={classes.pointer} onClick={() => this.changeLock(ambu.id, true)}/>
                                                }

                                                <Button variant="contained" color="default" disabled={!ambu.available}
                                                        className={classes.button} onClick={ () => this.moveStatus(ambu)}>
                                                    Kovetkezo
                                                    <Icon className={classes.rightIcon}>send</Icon>
                                                </Button>

                                            </CardActions>
                                        </Card>
                                    </Grid>
                                )
                            }
                        </Grid>
                        <EditPopup title="Add ambulance" label="Plate number" buttonLabel="Add"
                                   originalValue="" onAccept={(value) => this.addAmbulance(value)} type="floating"/>
                    </TabContainer>}
                    {this.state.tabState === 1 && <TabContainer>
                        <Paper>
                            <Table className={classes.table}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Patient Id</TableCell>
                                        <TableCell>Patient status</TableCell>
                                        <TableCell>Ambulance</TableCell>
                                        <TableCell>Kivonult</TableCell>
                                        <TableCell>Elindult</TableCell>
                                        <TableCell>Atadta</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.events.map(row => {
                                        return (
                                            <TableRow key={row.id}>
                                                <TableCell component="th" scope="row">
                                                    <EditPopup title="Edit patient id" label="Patient id"
                                                               buttonLabel="Save" default="ID"
                                                               originalValue={row.patientId}
                                                               onAccept={(value) => this.savePatient(row.id, 'patientId', value)} type="fixed"/>
                                                </TableCell>
                                                <TableCell><EditSelectPopup title="Edit patient status" label="Patient status"
                                                    buttonLabel="Save" default="Status"
                                                    originalValue={row.patientStatus} selectValues={selectValues}
                                                    onAccept={(value) => this.savePatient(row.id, 'patientStatus', value)} type="fixed"/></TableCell>
                                                <TableCell>{row.ambulance.name}</TableCell>
                                                <TableCell>{row.kivonult}</TableCell>
                                                <TableCell>{row.elindult}</TableCell>
                                                <TableCell>{row.atadta}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Paper>
                    </TabContainer>}
                </div>
            </div>
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);