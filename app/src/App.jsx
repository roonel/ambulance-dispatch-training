import React, {Component} from 'react'
import db from './db';


export default class App extends Component {
    constructor(props){
        super(props);
        this.state = {ambu:""}
    }

    getFromDb(){
        db.ambulance.get(1).then(amb => {
            this.setState({ambu: amb.name});
        })
    }

    render() {

        return (
            <div>

                <div className="hello">
                    <h1>Hello! {this.state.ambu}</h1>
                </div>

                <button
                    className="square"
                    onClick={() => this.getFromDb()}>
                    Klikk
                </button>
            </div>
        )
    }
}
