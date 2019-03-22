/* eslint-disable react/destructuring-assignment */
import React from 'react';
import classNames from 'classnames';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/nova-light/theme.css';
import '../stylesheets/vars.scss';
import axios from 'axios';
import Papa from 'papaparse';

// eslint-disable-next-line no-undef

class Jobs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layoutMode: 'static',
      //layoutColorMode: 'dark',
      mobileMenuActive: false,
      jobs: null,
      visible: false,
      client: "",
      address: "",
      activity: false,
      selected: [],
      updatedRows: [],
      showWarning: false,
      emptyFields: false,
      file: null,
      showFileWarning: false,
      showFileSuccess: false,
      results: null,
      resultsJSON: null,
    };
  }

  componentDidMount = async () =>{
    try{
      const newJobs = await axios('https://api-dot-muller-plumbing-salary.appspot.com/jobs');
      this.setState({jobs: newJobs.data});
    } catch (e){
      console.error(e);
      this.setState({jobs: []});
    }
  }
  
  isActive = (rowData) => {
    return rowData.isActive;
  }

  changeActive = (rowData, e) =>{
    let upjobs = [...this.state.jobs];
    let ind = this.state.jobs.indexOf(rowData);
    if(ind !== -1){
      if(e.checked){
        upjobs[ind].isActive = true;
      } else {
        upjobs[ind].isActive = false;
      }
      this.setState({jobs: upjobs});
      let newUpRows = [...this.state.updatedRows];
      newUpRows.push(rowData);
      this.setState({updatedRows: newUpRows});
    }
  }

  onEditorValueChange = (props, value) =>{
    let updatedjobs = [...this.state.jobs];
    updatedjobs[props.rowIndex][props.field] = value;
    let notAdded = true;
    for(let i = 0; i < this.state.updatedRows.length; i++){
      if(this.state.updatedRows[i]['id'] === updatedjobs[props.rowIndex]['id']){
        notAdded = false;
      }
    }
    if(notAdded){
      let newUpRows = [...this.state.updatedRows];
      newUpRows.push(updatedjobs[props.rowIndex]);
      this.setState({updatedRows: newUpRows});
    }
    this.setState({jobs: updatedjobs});
  }

  onHideYes = async () => {
    if(this.state.client !== "" && this.state.address !== "" && this.state.activity !== null){
      //Add here
      try{
        let url = 'https://api-dot-muller-plumbing-salary.appspot.com/jobs';
        let toAdd = []
        toAdd.push( {id: null, clientName: this.state.client, address: this.state.address, isActive: this.state.activity});
        await axios.post(url, toAdd);
      } catch (e){
        console.error(e);
      }
      try{
        const newJobs = await axios('https://api-dot-muller-plumbing-salary.appspot.com/jobs');
        this.setState({jobs: newJobs.data});
      } catch (e){
        console.error(e);
        this.setState({jobs: []});
      }
      this.setState({client: ""});
      this.setState({address: ""});
      this.setState({activity: false});
      this.setState({visible: false});
    } else {
      this.setState({emptyFields: true});
    }  
  }

  onHide = () => {
    this.setState({visible: false});
    this.setState({client: ""});
    this.setState({address: ""});
    this.setState({activity: false});
  }  
  onHideWarning = () => {
    this.setState({showWarning: false});
  }
  onHideFileWarning = () => {
    this.setState({showFileWarning: false});
  }
  onHideFileSuccess = () => {
    this.setState({showFileSuccess: false});
  }

  clientEditor = (props) => {
      return <InputText type="text" value={this.state.jobs[props.rowIndex]['clientName']} onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
  }

  addressEditor = (props) => {
    return <InputText type="text" value={this.state.jobs[props.rowIndex]['address']} onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
  }


  delete = async() => {
    if(this.state.selected.length > 0){
      for(let i = 0; i < this.state.selected.length; i++){
        let tempId = this.state.selected[i]['id'];
        let url = `https://api-dot-muller-plumbing-salary.appspot.com/jobs/${tempId}`;
        try{
          await axios.delete(url);
          const newArray = this.state.updatedRows.filter(function(val, ind, arr){
            return val['id'] !== tempId;
          });
          this.setState({updatedRows: newArray});
        } catch (e){
          console.error(e);
        }
      }
      try{
        const newJobs = await axios('https://api-dot-muller-plumbing-salary.appspot.com/jobs');
        this.setState({jobs: newJobs.data});
      } catch (e){
        console.error(e);
        this.setState({jobs: []});
      }
      this.setState({selected: []});
    }
  }

  onChanges = (e) => {
    if(e.checked){
      this.setState({activity: true});
    } else {
      this.setState({activity: false});
    }
  }

  handleselectedFile = event => {
    this.setState({file: event.target.files[0]});
  }

  saveCSV = () => {
    let data = [...this.state.results];
    data[0] = ["jobNumber", "clientName", "ig1", "ig2", "ig3", "address", "ig4", "ig5", "isActive", "id"];
    for(let i = 0; i < data.length; i++){
      data[i].splice(2,3);
      data[i].splice(3,2);
      //remove line below to add jobNumber
      data[i].splice(0,1);
      if(i !== 0){
        data[i].push(true);
        data[i].push(null);
      }
    }
    this.setState({results: data});
    let resJSON = [];
    for(let i = 1; i < data.length; i++){
      let hash = {};
      for(let j = 0; j < data[0].length; j++){
        hash[data[0][j]] = data[i][j];
      }
      resJSON.push(hash);
    }
    this.setState({resultsJSON: resJSON});
    this.saveToAPI();
  }

  saveToAPI = async() => {
    try{
      console.log(this.state.resultsJSON);
      let url = 'https://api-dot-muller-plumbing-salary.appspot.com/jobs';
      await axios.post(url, this.state.resultsJSON);
    } catch (e){
      this.setState({showFileWarning: true});
      console.error(e);
    }
    try{
      const newJobs = await axios('https://api-dot-muller-plumbing-salary.appspot.com/jobs');
      this.setState({jobs: newJobs.data});
      this.setState({showFileSuccess: true});
    } catch (e){
      this.setState({showFileWarning: true});
      console.error(e);
      this.setState({jobs: []});
    }
  }

  saveResults = (re) => {
    if(re.errors.length === 0){
      this.setState({results: re.data});
      this.saveCSV();
    } else {
      this.setState({showFileWarning: true});
    }
  }

  callUpload = () => {
    this.handleUpload(this.saveResults);
  }

  handleUpload = (saveResults) => {
    Papa.parse(this.state.file, {complete: function(results){
      saveResults(results);
    }});
  }

  saveChanges = async () => {
    if(this.state.updatedRows !== []){
      try{
        let url = 'https://api-dot-muller-plumbing-salary.appspot.com/jobs';
        await axios.post(url, this.state.updatedRows);
      } catch (e){
        console.error(e);
      }
      try{
        const newJobs = await axios('https://api-dot-muller-plumbing-salary.appspot.com/jobs');
        this.setState({jobs: newJobs.data});
      } catch (e){
        console.error(e);
        this.setState({jobs: []});
      }
      this.setState({updatedRows: []});
    }
  }


  render() {

    const footer = (
      <div>
          <Button label="Yes" icon="pi pi-check" onClick={this.onHideYes} />
          <Button label="No" icon="pi pi-times" onClick={this.onHide} />
      </div>
    );
    const wrapperClass = classNames('layout-wrapper', {
      'layout-static': this.state.layoutMode === 'static',
      'layout-mobile-sidebar-active': this.state.mobileMenuActive,
    });
    const mainPart = classNames('layout-main');
    return (
      <div className={wrapperClass}>
        <div className={mainPart}>
            <div>
              <div style={{textAlign: 'center', fontSize: '30px'}}>Manage Jobs</div>
              <div>
                  <Dialog header="There was an error uploading the file" visible={this.state.showFileWarning} style={{width: '50vw'}} modal={true} onHide={this.onHideFileWarning}>
                    <span style={{paddingTop:'25px', display: 'block'}}>
                        <label style={{padding: '10px'}}>The file that you tried to upload failed. Please ensure that the format is correct and there aren't any empty lines</label>
                    </span>
                  </Dialog> 
                  <Dialog header="File Upload Successful" visible={this.state.showFileSuccess} style={{width: '50vw'}} modal={true} onHide={this.onHideFileSuccess}>
                    <span style={{paddingTop:'25px', display: 'block'}}>
                        <label style={{padding: '10px'}}>The file has been uploaded.</label>
                    </span>
                  </Dialog>  
                  <Dialog header="Add Job" footer={footer} visible={this.state.visible} style={{width: '50vw'}} modal={true} onHide={this.onHide}>
                    <span style={{paddingTop:'25px', display: 'block'}}>
                        <label style={{padding: '10px'}}>Client</label>
                        <InputText id="in" value={this.state.client} onChange={(e) => this.setState({client: e.target.value})} />
                    </span> 
                    <span style={{paddingTop:'25px', display: 'block'}}>
                        <label style={{padding: '10px'}}>Address</label>
                        <InputText id="in" value={this.state.address} onChange={(e) => this.setState({address: e.target.value})} />
                    </span>
                    <span style={{paddingTop:'25px', display: 'block'}}>
                        <label style={{padding: '10px'}}>Active</label>
                        <Checkbox id="in" checked={this.state.activity} onChange={this.onChanges} />
                    </span>  
                  </Dialog>
                  <Dialog header="You have unsaved Changes" footer={footer} visible={this.state.showWarning} style={{width: '50vw'}} modal={true} onHide={this.onHideWarning}>
                    <span style={{paddingTop:'25px', display: 'block'}}>
                        <label style={{padding: '10px'}}>The changes you made have not been saved</label>
                    </span>  
                  </Dialog>
                  <div style={{paddingBottom: '5px', paddingTop: '5px', width: '15%'}}>
                    <Button id="addB" label="Add Job" className="p-button-danger" width="20px" onClick={(e) => this.setState({visible: true})}/>
                    <Dialog header="Empty Fields" visible={this.state.emptyFields} style={{width: '50vw'}} modal={true} onHide={(e) => this.setState({emptyFields: false})}>
                      Please enter all values when adding a Job
                    </Dialog>
                  </div>
                <div>
                  <DataTable value={this.state.jobs} scrollable={true} scrollHeight="14vw" selection={this.state.selected} onSelectionChange={e => this.setState({selected: e.value})}>
                          <Column field="clientName" header="Client" filter={true} filterMatchMode={"contains"} filterType={"inputtext"} editor={this.clientEditor}/>
                          <Column field="address" header="Address" editor={this.addressEditor}/>
                          <Column field="isActive" header="Active " style={{textAlign:'center'}} body={ (rowData, column) => (
                              <Checkbox onChange={(e) => {this.changeActive(rowData, e)}} checked={this.isActive(rowData)} />) }/>
                          <Column selectionMode="multiple" field="del" header="Delete " style={{textAlign:'center'}} />
                      </DataTable>
                </div>  
              </div>
              <div>
                <div className="deleteCodes" style={{paddingBottom: '5px', paddingTop: '5px'}}>
                  <Button id="deleteB" label="Delete Selected" className="p-button-primary" onClick={this.delete}/>
                </div>
                <div className="saveChanges" style={{paddingBottom: '5px', width: '20%'}}>
                  <Button id="saveB" label="Save Changes" className="p-button-success" style={{padding: '5px'}} onClick={this.saveChanges}/>
                </div>
                <div style={{paddingBottom: '5px', fontSize: '15px'}}>
                  <h4>Upload file</h4>
                  <input id="input-file" type="file" onChange={this.handleselectedFile} style={{paddingBottom: '5px', fontSize: '17px'}} accept=".csv"/>
                  <Button label="Upload" icon="pi pi-upload" onClick={this.callUpload}/>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export default Jobs;
