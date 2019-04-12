/* eslint-disable react/destructuring-assignment */
import React from 'react';
import classNames from 'classnames';
import { Menu } from 'primereact/menu';
import TimeSheets from './TimeSheets';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/nova-light/theme.css';
import '../stylesheets/vars.scss';
import CostCodes from './CostCodes';
import Employees from './Employees';
import Welcome from './Welcome';
import Jobs from './Jobs';
import firebase from "firebase/app";
import "firebase/auth";
import axios from "axios";
const config = {
  apiKey: "AIzaSyDrgNlR0m7XWkP3xXUcxJakkgih4uG7j6k",
  authDomain: "muller-plumbing-salary.firebaseapp.com",
  databaseURL: "https://muller-plumbing-salary.firebaseio.com",
  projectId: "muller-plumbing-salary",
  storageBucket: "muller-plumbing-salary.appspot.com",
  messagingSenderId: "717687086763"
};
firebase.initializeApp(config);

firebase.auth().onAuthStateChanged(async function(user) {
  if (user) {
    axios.defaults.headers.common = {'Authorization': `bearer ${await user.getIdToken(true)}`}
  } else {
    let provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithRedirect(provider);
  }
});
// eslint-disable-next-line no-undef

class App extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      layoutMode: 'static',
      // layoutColorMode: 'dark',
      mobileMenuActive: false,
      mode: 'welcome',
      listOf:[
        { label: 'Manage Employees', icon: 'pi pi-fw pi-users', command:(e)=>{this.setState({mode: 'emps'})}},
        { label: 'Manage Jobs', icon: 'pi pi-fw pi-home' , command:(e)=>{this.setState({mode: 'jobs'})}},
        { label: 'Manage Cost Codes', icon: 'pi pi-fw pi-key', command:(e)=>{this.setState({mode: 'costcodes'})}},
        { label: 'Download Time Sheets', icon: 'pi pi-fw pi-calendar', command:(e)=>{this.setState({mode: 'timesheets'})}}
      ],
    };
  }

    renderPage = () => {
    if(this.state.mode === 'welcome'){
      return <Welcome/>;
    } else if(this.state.mode === 'timesheets'){
      return <TimeSheets/>;
    } else if(this.state.mode === 'costcodes'){
      return <CostCodes/>;
    } else if(this.state.mode === 'jobs'){
      return <Jobs/>;
    } else if(this.state.mode === 'emps'){
      return <Employees/>;
    } else {
      return <div>Couldn't find page</div>
    }
  }

  render() {
    const wrapperClass = classNames('layout-wrapper', {
      'layout-static': this.state.layoutMode === 'static',
      'layout-mobile-sidebar-active': this.state.mobileMenuActive,
    });
    const sidebarClassName = classNames('layout-sidebar', { 'layout-sidebar-dark': this.state.layoutColorMode === 'dark' });
    const topBar = classNames('layout-topbar');
    return (
      <div className={wrapperClass}>
        <div className={topBar} style={{ fontFamily: 'bakersville', fontStyle: 'bold', fontSize: '3vw' }}>
          Muller Plumbing and Heating
        </div>
        <div className={sidebarClassName}>
          <Menu model={this.state.listOf}/>
        </div>
        <div>
          {this.renderPage()}
        </div>
      </div>
    );
  }
}

export default App;
