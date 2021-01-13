import React, { Component } from 'react'
import {connect} from 'react-redux'
// import {selectMovie} from "../actions/index"
import {setUserData,setIndices} from '../actions/testActions'
import {bindActionCreators} from 'redux'
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
// import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import axios from 'axios'
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import BarGraph from '../components/common/BarGraph'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import LoginSignup from '../components/common/LoginSignup'
import TextField from '@material-ui/core/TextField';
// import Card from '@material-ui/core/Card';
// import CardActions from '@material-ui/core/CardActions';
// import CardContent from '@material-ui/core/CardContent';
// import Typography from '@material-ui/core/Typography';
import Rating from '@material-ui/lab/Rating';
import '../../style/style.css'
const FEEDBACK_OBJECT_TYPE='test'
const FEEDBACK_SCALE=5
export const SERVER_URL_SEARCHER=`http://localhost:8081`
export const SERVER_URL_ANALYZER=`http://localhost:8082`
const DEBOUNCE_TIME_MS=200
const sidemenuOptions = [{label:"Search Demo",name:"searchDemo"},{label:"Dump Data","name":"dumpData"},{label:"Set Search Fields",name:"setSearchFields"},{label:"Analyze Queries",name:"analyzeQueries"}];

class Dashboard extends Component{
    constructor(props){
        super(props)
        this.state={selectedMenuItem:{},selectedIndice:null,showLoginSignup:true,headerButtonText:"Login / Signup"}
    }  
    
    componentWillReceiveProps(newProps){
      // console.log("====debug===new props",newProps,this.props);
      if(!this.props.userData && newProps.userData){
        this.Handlers.fetchIndicesForApp(newProps.userData)
        //TODO: fetch indices for appId. 
      }
    }

    DataHelpers={
       isMenuSelected:(menuObj)=>{
          const selectedMenu = this.state.selectedMenuItem;
          if(selectedMenu && selectedMenu.name === menuObj.name){
             return true
          }
          return false
       },
      isValidJson:(json) => {
        try {
            JSON.parse(json);
            return true;
        } catch (e) {
            return false;
        }
    }
    }
   debounce = (callback, wait) => {
      let timeout;
      return (...args) => {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          callback.apply(context, args);
        },
        wait);
      };
    };
    Handlers={
      querify:this.debounce(async(query) => {

        const url =`${SERVER_URL_SEARCHER}/query`
        const defaultPagination = {"skip":0,"limit":100}
       
        const {userData} = this.props
        const params = {
          appId:userData.appId,
          index:this.state.selectedIndice,
          query:query,
          paginateInfo:defaultPagination
        }
        
        if(query){
          let result = await axios.post(url,params)
          // console.log("====debug====search result",result);
          if(result && result.data){
              const {totalCount,hits} = result.data;
              this.setState({totalCount,hits})
          }
        }
        else{
          this.setState({totalCount:0,hits:[]})
        }
       
        
      }, DEBOUNCE_TIME_MS),
      handleSearchFieldChange:(e)=>{
         const query = e.target.value
         this.setState({query})
         this.Handlers.querify(query);
      },
      saveIndiceFields:async()=>{
        const url =`${SERVER_URL_SEARCHER}/setting/updateSearchField` 
        const {userData} = this.props
        const params = {
          appId:userData.appId,
          index:this.state.selectedIndice,
          fields:this.state.selectedIndiceFields
        }
        
        let result = await axios.post(url,params)
        if(result && result.data){
          window.alert("Indices saved Successfully");
          this.setState({selectedMenuItem:null})
          // this.Handlers.fetchIndicesForApp(this.props.userData);
        }
      },
      addIndiceField:(field)=>{
        const selectedIndiceFields = this.state.selectedIndiceFields?this.state.selectedIndiceFields:[];
        if(!selectedIndiceFields.includes(field)){
          selectedIndiceFields.push(field);
        }
        this.setState({selectedIndiceFields})
      },

      saveObjects:async()=>{
        const url =`${SERVER_URL_SEARCHER}/save/objects` 
        const {userData} = this.props
        const params = {
          appId:userData.appId,
          index:this.state.newIndice || this.state.selectedIndice,
          objects:this.state.saveObjContent?JSON.parse(this.state.saveObjContent):[]
        }
        
        let result = await axios.post(url,params)
        if(result && result.data){
          window.alert("Objects Saved Successfully");
          this.setState({selectedIndice:null,newIndice:null})
          this.Handlers.fetchIndicesForApp(this.props.userData);
        }
        // console.log("====debug====result",result);
      },
      setSaveObjectContent:(e)=>{
          const saveObjContent = e.target.value;
          this.setState({saveObjContent})
          let valid = this.DataHelpers.isValidJson(saveObjContent);
          
          if(valid===false){
             const saveObjectError="invalid JSON structure."
             this.setState({saveObjectError})
            }
            else{
              this.setState({saveObjectError:null})
            }
          if(!saveObjContent){
            this.setState({saveObjectError:null})
          }
        },
      postIndiceChange:async()=>{
        if(this.state.selectedMenuItem){
          const {name}=this.state.selectedMenuItem
          switch(name){
            case "setSearchFields":
              //TODO:fetch fields for indice.
              const url =`${SERVER_URL_SEARCHER}/getFieldsForIndice` 
              const {userData} = this.props
              
              const params = {
                appId:userData.appId,
                indice:this.state.selectedIndice
              }
              let result = await axios.get(url,{params})
              if(result){
                const {data} = result;
                this.setState({allFieldsForSelectedIndice:data})
              }
             break;    
          }}
      },
      handleIndiceChange:(e)=>{
        const indice = e.target.value;
        this.setState({selectedIndice:indice},()=>{
          this.Handlers.postIndiceChange();
        })
      },
      handleNewIndiceChange:(e)=>{
        const newIndice = e.target.value
        this.setState({newIndice})
      },
      fetchIndicesForApp:async (userData)=>{
        const url =`${SERVER_URL_SEARCHER}/getIndicesForApp` 
        const params = {
          appId:userData.appId
        }
        let result = await axios.get(url,{params})
        if(result){
          const {data} = result;
          this.props.setIndices(data);
        }
      },
      handleSideMenuSelect:(menuItem)=>{
         this.setState({selectedMenuItem:menuItem})
      },
        setUser:(userData)=>{
            this.props.setUserData(userData)
            if(userData && Object.keys(userData).length){
                this.setState({showLoginSignup:false,headerButtonText:"Log-out"})
            }
        },
        handleLoginSignup:()=>{
            let headerButtonText
            if(!this.state.showLoginSignup){
                    headerButtonText="Welcome to Searcher Dashboard"
                }
            else{
                headerButtonText="Login / Signup"
            }
            if(this.state.headerButtonText==='Log-out'){
                this.props.setUserData(null)
                // headerButtonText='Login / Signup'
                this.setState({headerButtonText,showLoginSignup:true})
            }
            else{
                this.setState({showLoginSignup:!this.state.showLoginSignup,headerButtonText})
            }
            },
      }
   componentDidUpdate(prevProps,prevState){
    if(!prevProps.userData && this.props.userData){
      //   this.fetchTests()
    }  
    
    if(prevProps.userData && this.props.userData && prevProps.userData.email!==this.props.userData.email){
      //   this.fetchTests()
      }

   }
 

    
    Renderers={
      renderCTAs:()=>{
        if(this.state.selectedMenuItem){
          const {name}=this.state.selectedMenuItem
          switch(name){
            case "dumpData":
              if(this.state.saveObjContent && !this.state.saveObjectError){
                return (<div style={{display:"flex"}}>
              <div style={{width:"120px"}}><Button variant="contained" color="primary" onClick={this.Handlers.saveObjects}>
                 Save
               </Button>
                </div>

                  </div>) 
              }
              break;
            case "setSearchFields":
              if(this.state.selectedIndiceFields){
                return (<div style={{display:"flex"}}>
                <div style={{width:"120px"}}><Button variant="contained" color="primary" onClick={this.Handlers.saveIndiceFields}>
                   Update Search Fields
                 </Button>
                  </div>
  
                    </div>) 
              }
              break;
          }
      }},
      renderLoginSignup:()=>{
            return(<div style={{width:"50%"}}><LoginSignup setUser={this.Handlers.setUser} /></div>)
      },
        renderSideMenu:()=>{
         return (
         <div style={{paddingTop:"100px"}}><Drawer
            variant="permanent"
            anchor="left"
          >
             <Divider />
        <List>
          {sidemenuOptions.map((menuObj, index) => (
            <ListItem selected={this.DataHelpers.isMenuSelected(menuObj)} onClick={()=>this.Handlers.handleSideMenuSelect(menuObj)} button key={menuObj.name}>
              {/* <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon> */}
              <ListItemText  value={menuObj.name} primary={menuObj.label} />
            </ListItem>
          ))}
        </List>
             </Drawer>
             </div>) 
        },
        renderDumpDataSection:()=>{
          if(this.state.selectedIndice || this.state.newIndice){
            return (<div style={{paddingTop:"30px",}}>
              <div style={{paddingBottom:"20px"}}>
              <Typography>Dump data here as Array of JSON. Include objectID in json object if want to update existing data.</Typography></div>
              {this.state.saveObjectError && <div style={{color:"red"}}><Typography>{this.state.saveObjectError}</Typography></div>}
              <TextareaAutosize rows={10} cols={60} aria-label="empty textarea" value={this.state.saveObjContent} onChange={this.Handlers.setSaveObjectContent} placeholder="Input Array of Jsons." /></div>)
          }
        },
        renderIndices:()=>{
            const indicesElements = []
            if(this.props.indices){
              const {indices} = this.props
              for(let indice of indices){
                indicesElements.push(
                  <MenuItem value={indice} onClick={this.Handlers.handleIndiceChange} name={indice}>{indice}</MenuItem>);
              }
            }

            return (
              <FormControl>
              <InputLabel>Indice For Operation</InputLabel>
            <Select
            className="options-select"
            id="demo-simple-select-readonly"
            value={this.state.selectedIndice}
            onChange={this.Handlers.handleIndiceChange}
            style={{ minWidth: "200px" }}
            disabled={this.state.newIndice}
        >
           {indicesElements}
        </Select>
        </FormControl>)
          
        },

        renderNewIndiceField:()=>{
          return (
          <div style={{paddingTop:"30px"}}>
            <div>
              Or add a new indice</div><TextField id="standard-basic" onChange={this.Handlers.handleNewIndiceChange} label="New Indice" /></div>)
        },
        renderAllFields:()=>{
         let elements =[];
         if(this.state.allFieldsForSelectedIndice){
          elements.push(<div>Select fields to set as searchable fields</div>)
          const checkboxElements = []
          for(let field of this.state.allFieldsForSelectedIndice){
            checkboxElements.push(<div style={{display:"flex",alignItems:"center"}}><Checkbox
              checked={this.state.selectedIndiceFields && this.state.selectedIndiceFields.includes(field)}
              onChange={()=>this.Handlers.addIndiceField(field)}
             
          /><div>{field}</div></div>)
          }
        elements.push(<div style={{marginTop:"20px"}}>{checkboxElements}</div>)   
         }
        return elements
        },  
        renderSearchElement:(element)=>{
           const rowElements = [];
           if(element){
             const keys = Object.keys(element);
             for(let key of keys){
                 console.log("====debug====key",key,element[key])
                 rowElements.push(<div style={{display:"flex",maxWidth:"70%"}}>
                   <div style={{fontWeight:"bold"}}>
                   <Typography gutterBottom>{key}
                   </Typography></div>:

                   <div style={{marginLeft:"30px"}}>
                   <Typography color="textSecondary" gutterBottom>
                   {element[key]}
                   </Typography>
                     </div>
                 </div>)
             }
            }

           return (
            <div style={{padding:"20px"}}>
            <Card>
           <CardContent>
           <div style={{display:"flex",flexDirection:"column"}}>
             {rowElements}
           </div>
           </CardContent>
           </Card>
           </div>
           )

        },
        renderSearchSection:()=>{
         const searchElements = []
        if(this.state.selectedIndice){
          searchElements.push(<TextField id="standard-basic" onChange={this.Handlers.handleSearchFieldChange} label="Enter Query" />)   
          // console.log("====debug===hits",this.state.hits)
          if(this.state.hits && this.state.hits.length){
            searchElements.push( <div style={{fontWeight:"bold", padding:"10px"}}>
            <Typography gutterBottom>Total found results: {this.state.totalCount}
            </Typography></div>) 
            for(let hit of this.state.hits){
                searchElements.push(this.Renderers.renderSearchElement(hit.objContent))
              }

          }
          else{
            searchElements.push( <div style={{fontWeight:"bold", padding:"10px"}}>
            <Typography gutterBottom>No results found
            </Typography></div>) 
          }
        }

         return <div style={{}}>
         
           {searchElements}
         </div> 
        },

        renderMainDiv:()=>{
         const defaultDiv = <div>
           <Typography variant="h3" gutterBottom>
        Welcome to Searcher's Admin Dashboard.
      </Typography>
      <Typography variant="h5" color="textSecondary" gutterBottom>
        Here you can dump data to your indices, set searchable fields and analyze queries based on timestamp.
        And you can see searching demo too.
      </Typography>
      <Typography variant="h5" gutterBottom>
        Although we recommend to use our APIs from your Client for dumping data and performing search.
        </Typography>
         </div>
         let mainElement = []
          
         if(this.state.selectedMenuItem){
           const {name}=this.state.selectedMenuItem
           if(name){
            mainElement.push(this.Renderers.renderIndices())
            
           }
           switch(name){
             case "dumpData":
               mainElement.push(this.Renderers.renderNewIndiceField())
               mainElement.push(this.Renderers.renderDumpDataSection())
               break;

              case "setSearchFields":
                mainElement.push(this.Renderers.renderAllFields()) 
                break;
              case `searchDemo`:
                mainElement.push(this.Renderers.renderSearchSection()); 
                break;
              }
         }
         if(mainElement.length===0){
           mainElement = defaultDiv;
         } 
         console.log("===debug===selectedmenu",this.state.selectedMenuItem)
         
         return(mainElement)
        },
        renderMainScreen:()=>{
            return <React.Fragment>{this.Renderers.renderSideMenu()}
            {this.Renderers.renderMainDiv()}
            {this.Renderers.renderCTAs()}
            </React.Fragment>
        },
        renderHeader:()=>{
               let style = {padding:"50px",width:"30%"}
               if(this.state.headerButtonText==='Log-out'){
                  style['float']="right";
                  style['marginTop']='-50px';
                  style['marginRight']='-100px';
               }
               return(<div className="header-wrapper">
                    <div style={style}>
                 {!this.state.showLoginSignup && <Button variant="contained" color="primary" onClick={this.Handlers.handleLoginSignup}>
                 {this.state.headerButtonText}
                 </Button>}
             </div>
             </div>)
           },
       }

    
    componentDidMount(){
    } 
    render(){
      console.log("===debug===props",this.props)
      return(<React.Fragment>
        <div className="test-container">
        <div className="test-container-header">{this.Renderers.renderHeader()}</div>
        { this.state.showLoginSignup ? this.Renderers.renderLoginSignup()
        :this.Renderers.renderMainScreen()}
            
            </div>
         </React.Fragment>)
    }

}
function mapStateToProps(state){
   return {userData:state.userData,indices:state.indices}
}

function mapDispatchToProps(dispatch){
   return bindActionCreators({setUserData,setIndices},dispatch)
}

/*this is called exporting the container.*/
/*a container is nothing but a component which is aware of redux state*/
export default connect(mapStateToProps,mapDispatchToProps)(Dashboard);

/*imp thing: whenever there is change in redux state, the containder will re-render*/