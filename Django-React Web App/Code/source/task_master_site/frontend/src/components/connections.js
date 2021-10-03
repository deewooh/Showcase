import React, { Component } from "react";
import axiosInstance from "../axiosApi";

import axios from "axios";
import Modal from "./ConnectionModal";
import ViewModal from "./ViewUserModal"

class Connections extends Component {
    constructor(props) {
        super(props);
        this.state = {
            error: "",
            connectionList: [],
            modal: false,
            viewmodal: false,
            viewUser: {
              user_id: "",
              workload: -1,
              username: "",
              tasks:{},
            },
            activeItem: {
                receiver: "",
            }
        };

    }
    
    // Component did mount is immediately called when the Component is called
    // Use this to initalize anything
    componentDidMount(){
        this.refreshList();
    }

    // refreshList = (id) => {
    //     axiosInstance
    //         .get("/connections/")
    //         .then(((res) => this.setState({connectionList: res.data})))
    //         .catch((err) => console.log(err));
    // };

    async refreshList(){
      try {
        const response = await axiosInstance.get(`/connections/`, {});
        this.setState({
            connectionList: response.data
        })
        return response;
    } catch (error) {
        if (error.response) {
            // There is an error response from the server
            // You can anticipate error.response.data here
            this.setState({error: error.response.data});
        } else if (error.request) {
            // The request was made but no response was received
            // Error details are stored in error.reqeust
            console.log(error.request);
        } else {
            // Some other errors
            console.log('Error', error.message);
        }
    }
  }
    
    render() {
        return (
        <div>

        
          <div className="row">
            <div className="col-md-6 col-sm-10 mx-auto p-0">
              <div className="card p-3">
                <div className="mb-4">
                  <button 
                    className="btn btn-blue"
                    onClick={() => this.createItem()}>
                    Add Connection
                  </button>
                </div>  
                <p>
                  {this.state.error}
                </p>  
                <ul className="list-group list-group-flush border-top-0">
                  <h3 className="text-dblue text-center m-2">Connections</h3>
                  {this.renderCompleteConnections()}
                </ul>
                <ul className="list-group list-group-flush border-top-0">
                <h3 className="text-dblue text-center m-2">Sent Requests</h3>
                  {this.renderSentConnections()}
                </ul>
                <ul className="list-group list-group-flush border-top-0">
                <h3 className="text-dblue text-center m-2">Received Requests</h3>
                  {this.renderReceivedConnections()}
                </ul>

              </div>
            </div>
          </div>
          {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
          />
        ) : null}
        {this.state.viewmodal ? (
          <ViewModal
            username={this.state.viewUser.username}
            workload = {this.state.viewUser.workload}
            tasks = {this.state.viewUser.tasks}
            toggle={this.toggleViewModal}
          />
        ) : null}

        
      </div>
    );
    }

    createItem = () => {
      const item = { 
        receiver:""
      };
  
      this.setState({ activeItem: item, modal: !this.state.modal });
    };
  

    addConnection = () => {
      this.toggle();
    }

    toggle = () => {
      this.setState({ modal: !this.state.modal });
    };

    handleSubmit = (item) => {
      this.toggle();
      const data = {requestTo: item["receiver"], requestFrom: this.props.data.username};
      console.log(this.props.data.username)
      axios.post("/api/createConnection/", data)
      .then(this.setState({error:""}))
      .catch((error) => {
        if (error.response.status == 400) {
          this.setState({error:"Already Connected User or adding yourself."})
        } else if (error.response.status == 500) {
          this.setState({error:"This user does not exist."})
        }
      });
      this.refreshList();
      this.refreshList();
    }

    renderCompleteConnections = () => {
      let arr = this.state.connectionList.filter((item) => item.status == true)
      arr = arr.filter((item) => (item.receiver == this.props.data.user_id || item.sender == this.props.data.user_id))
      if (arr.length == 0) {
        return <p>No connections to show. Find connections by pressing "Add Connection" Button!</p>
      }
      return arr.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              className={`text-dblue mr-2 `}
              title={item.receiver}
            >
              {item.receiver == this.props.data.user_id ? item.sender_username : item.receiver_username}
              </span>
              <button
            className="fright btn btn-blue mr-2"
            onClick={() => this.viewUser(item)}
          >
            View
          </button>
            
            
          </li>
        ));
  }

  renderSentConnections = () => {
    let arr = this.state.connectionList.filter((item) => item.sender == this.props.data.user_id && item.status == false);
    if (arr.length == 0) {
      return <p>No sent connections.</p>
    } else {
      return arr.map((item) => (
          <li
            key={item.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span
              className={`text-dblue mr-2 `}
              title={item.receiver}
            >
              
              {item.receiver_username}
            </span>
            
          </li>
        ));
    }
    
  }
      renderReceivedConnections = () => {
        let arr = this.state.connectionList.filter((item) => item.receiver == this.props.data.user_id && item.status == false);
        if (arr.length == 0) {
          return <p>No requests received.</p>
        }
        return arr.map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <span
                className={`text-dblue mr-2 `}
                title={item.receiver}
              >
                {item.sender_username}
                
              </span>
              <span>
          
          <button
            className="padlad fright btn btn-orange"
            onClick={() => this.respondRequest(item, false)}
          >
            Decline
          </button>
          <button
            className="fright btn btn-blue mr-2"
            onClick={() => this.respondRequest(item, true)}
          >
            Accept
          </button>
        </span>
              
            </li>
          ));
    }

    respondRequest = (item, boo) => {
      const val = {willAccept: boo};
      axios.put(`/api/connections/${item.id}/`, val)
      this.refreshList()
    }


    async viewUser(item){
      // Check if refresh list should be done at the start
      this.refreshList();
      let u = "";
      let w = -1;
      let v = 0;
      if (item.receiver == this.props.data.user_id) {
        u = item.sender_username;
        w = item.sender_workload;
        v = item.sender;
      } else {
        u = item.receiver_username;
        w = item.receiver_workload;
        v = item.receiver;
      }
      try {
        const response = await axiosInstance.post(`/connections_tasks/`, {
          assigned_to: v,
        });
        //console.log(response.data)
        this.setState({viewUser: {user_id: v, username:u, workload:w, tasks: response.data}});
        return response;
      } catch (error) {
        if (error.response) {
            // There is an error response from the server
            // You can anticipate error.response.data here
            this.setState({error: error.response.data});
        } else if (error.request) {
            // The request was made but no response was received
            // Error details are stored in error.reqeust
            console.log(error.request);
        } else {
            // Some other errors
            console.log('Error', error.message);
        }
      } finally {
        this.toggleViewModal();
      }
    }


    toggleViewModal = () => {
      this.setState({ viewmodal: !this.state.viewmodal });
    };

    async getTasks(event, id) {
      await console.log(id);
     await axiosInstance 
      .get(`/connections_tasks/`, {
        assigned_to: id,
      })
      .then((res) => {res})
      .catch((err) => console.log(err));
  };


}

  


export default Connections;