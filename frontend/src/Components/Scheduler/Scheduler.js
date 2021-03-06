import React, { Component } from 'react'
import DatePicker from './DatePicker'
import Table from './Table'
import { Button } from 'semantic-ui-react'
import './scheduler.css'
import Sidebar from '../SideBar';
const {REACT_APP_BE_URL} = process.env;

const moment = require("moment")

class Scheduler extends Component {
    constructor(props) {
        super(props)
        this.getMinistryTypes();
        this.getUsers();
    }
    state = {
        listOfRoles: [],
        listOfPeople: [],
        years: [],
        months: [],
        selectedYear: null,
        selectedMonth: null
    }

    getMinistryTypes() {
        fetch(`${ REACT_APP_BE_URL }/ministries`, {method: 'GET'}).then(res => res.json()).then(res => this.setState({listOfRoles: res}))
    }
    getUsers() {
        fetch(`${ REACT_APP_BE_URL }/users`, {
                method: 'GET',
                withCredentials: true,
                headers: new Headers({
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('m3-auth-token'),
                    'Access-Control-Allow-Origin': '*',
                })                 
            }).then(res => res.json()).then(res => this.setState({listOfPeople: res.map(o => { return  {key: o.id, name : o.firstName + ' ' + o.lastName, role: "soundman"}} )}))
    }

    UNSAFE_componentWillMount(){
        this.getYearsAhead();
        this.getRemainingMonthsOfYear();
    }

     //Returns a list of years: 5 ahead
     getYearsAhead(){
        let currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        let year = [];
        for(let i=0; i<5; i++){
            year.push({key: 1+i, text: `${currentYear+i}`, value: currentYear+i})
        }
        this.setState({years: year});
    }

    //Returns a list of months that remains for the year
    getRemainingMonthsOfYear(year = moment().year()){
        let currentMonth = (year !== moment().year()) ? 0 : moment().month();
        let month = []
        while(currentMonth < 12){
            let monthName = moment().month(currentMonth).format("MMMM");
            month.push({key: currentMonth, text: `${monthName}`, value: currentMonth});
            currentMonth++;
        }
        this.setState({months: month})
    }

    //Returns a list of sundays
    getSundaysForSelectedMonthYear(selectedMonth, selectedYear){
        // Set chosenDate to the 1st of the selectedMonth in selectedYear.
        let chosenDate = moment().set({
            'year': this.state.selectedYear,
            'month': this.state.selectedMonth,
            'date': 1,
            'hour': 0,
            'second': 0,
            'millisecond': 0
        });

        let sundays = [];
        for(var i = 1; chosenDate.month() === this.state.selectedMonth; i++) {
            // If the month doesn't start on Monday, set chosenDate to the first Sunday of the month.
            if(chosenDate.day() !== 0) {
                chosenDate = chosenDate.day(7);
            }

            sundays.push({
                key: i,
                date: chosenDate.format("MMMM DD YYYY").toString(),
                timestamp: chosenDate.unix()
            });

            chosenDate.add(7, 'd');
        }

        return sundays;
    }

    selectYear = (year, month) => {
        this.setState({selectedYear: year});
        this.getRemainingMonthsOfYear(year);
    }
    
    selectMonth = (month) => {
        this.setState({selectedMonth: month});
    }

    render(){
        let { selectedYear, selectedMonth } = this.state;
        let listOfSundays;
        if(selectedYear && selectedMonth){            
            listOfSundays = this.getSundaysForSelectedMonthYear(selectedYear, selectedMonth);
        }
        return(
            <div class="scheduler-wrapper">       
                <Sidebar></Sidebar>         
                <DatePicker years = {this.state.years} months = {this.state.months} onYearSelect={this.selectYear} onMonthSelect={this.selectMonth} />
                <Table ref={(cd) => this.child = cd}
                       listOfSundays = {listOfSundays} 
                       listOfPeople = {this.state.listOfPeople}
                       listOfRoles = {this.state.listOfRoles}/>
                {listOfSundays && <Button positive floated='right' className = "send-button" onClick={this.child.save} > Send To All </Button>}
            </div>
        )
    }
}

export default Scheduler