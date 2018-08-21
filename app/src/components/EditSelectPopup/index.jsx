import React, {Component} from 'react'
import Modal from '@material-ui/core/Modal'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import Paper from "@material-ui/core/Paper";
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    paper: {
        position: 'absolute',
        left:0,
        right:0,
        top: 0,
        bottom: 0,
        'margin': 'auto',
        width: theme.spacing.unit * 50,
        height: theme.spacing.unit * 20,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing.unit * 4,
    },
    button: {
        margin: theme.spacing.unit,
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    addButton: {
        float: 'right'
    },
    footer: {
        position: 'fixed',
        bottom: 20,
        left: 0,
        right: 20,
        height: 50
    },
    selectEmpty: {
        marginLeft: theme.spacing.unit,
        marginTop: theme.spacing.unit * 2,
        marginBottom: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
});

class EditSelectPopup extends Component {

    constructor(props){
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.state = {open:false, value: this.props.originalValue ? this.props.originalValue : ""};
    };

    handleOpen() {
        this.setState({open: true, value: this.props.originalValue ? this.props.originalValue : ""});
    };

    handleClose(){
        this.setState({open: false});
    };

    buttonClick(){
        this.props.onAccept(this.state.value);
        this.handleClose();
    };

    handleChange(event) {
        this.setState({
            value: event.target.value,
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Modal
                    open={this.state.open}
                    onClose={this.handleClose}>
                    <Paper className={classes.paper}>
                        <Typography variant="title" id="modal-title">
                            {this.props.title}
                        </Typography>
                        <Typography variant="subheading" id="modal-inner">
                            <Select
                                value={this.state.value}
                                onChange={this.handleChange}
                                displayEmpty
                                className={classes.selectEmpty}
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {this.props.selectValues.map((x, i) =>
                                    <MenuItem key={i} value={x}>{x}</MenuItem>
                                )}
                            </Select>
                        </Typography>
                        <Button variant="outlined" className={classes.button}
                                onClick={ () => this.buttonClick()} disabled={!this.state.value || this.state.value.length === 0}>
                            {this.props.buttonLabel}
                        </Button>
                    </Paper>
                </Modal>

                {this.props.type === 'floating' &&
                <div className={classes.footer}>
                    <Button variant="fab" color="primary" aria-label={this.props.buttonLabel}
                            className={classes.addButton} onClick={ () => this.handleOpen()}>
                        <AddIcon />
                    </Button>
                </div>}
                {this.props.type === 'fixed' &&
                <div>
                    <Button variant="outlined" aria-label={this.props.buttonLabel} onClick={ () =>this.handleOpen()}>
                        {this.props.originalValue ? this.props.originalValue : this.props.default}
                    </Button>
                </div>}
            </div>
        );
    }
}


EditSelectPopup.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EditSelectPopup);