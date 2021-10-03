import React, { Component } from "react";
import Modal from "./Modal";
import SearchBar from "./SearchBar";
import axiosInstance from "../axiosApi";
import moment from "moment";
import ProgressBar from 'react-bootstrap/ProgressBar'

// Task Table adapated from open source tutorial:
// https://www.digitalocean.com/community/tutorials/build-a-to-do-application-using-django-and-react
export default class TaskList extends Component  {
  constructor(props) {
    super(props);
    this.state = {
      workload: "",
      viewState: "Not Started", // By default, we show "Not Started" tasks
      taskList: [],
      modal: false,
      errors: {},
      activeItem: {
        name: "",
        description: "",
        deadline: null, //Combined date and time field
        deadline_time: null,
        deadline_date: null,
        state: null,
        assigned_to: "Not Selected",
        duration: null
      },
      matchingTasksList: [],
    };
    this.getWorkload = this.getWorkload.bind(this);
  }

  componentDidMount() {
    this.refreshList();
  }

  refreshList = (id) => {
    axiosInstance
      .get("/tasks/")
      .then((res) => this.setState({ taskList: res.data }))
      .catch((err) => console.log(err));
    
      this.getWorkload();
  };

  async getWorkload() {
    try {
        const response = await axiosInstance.get(`/user_workload/`, {});
        this.setState({
            workload: response.data.workload
        })
        return response.workload;
    } catch (error) {
        if (error.response) {
            // There is an error response from the server
            // You can anticipate error.response.data here
            this.setState({errors: error.response.data});
        } else if (error.request) {
            // The request was made but no response was received
            // Error details are stored in error.reqeust
            console.log(error.request);
        } else {
            // Some other errors
            console.log('Error', error.message);
        }
    }
};

  toggle = () => {
    this.setState({ modal: !this.state.modal });
  };




  handleSubmit = (item) => {
    this.toggle();
    
    console.log(item);

    let item_validated = {
      id: item.id,
      name: item.name,
      description: item.description,
      deadline: null,
      deadline_time: item.deadline_time,
      deadline_date: item.deadline_date,
      state: item.state,
      assigned_to: item.assigned_to,
      duration: item.duration,
    }

    if((item.deadline_date !== null)&&(item.deadline_date !== "")){
      if((!item.deadline_time !== null)&&(item.deadline_time !== "")) {
        item_validated.deadline = moment(item.deadline_date + " " + item.deadline_time).format()
      } else {
        item_validated.deadline = moment(item.deadline_date + " " + "23:59").format()
      }
    }

    console.log(item_validated)
    //this.setState({ activeItem: item_validated, modal: !this.state.modal });
    

    if (item.id) {
      axiosInstance
        .put(`/tasks/${item.id}/`, item_validated)
        .then((res) => this.refreshList());
      return;
    }
      axiosInstance
        .post("/tasks/", item_validated)
        .then((res) => this.refreshList());
  };

  handleDelete = (item) => {
    axiosInstance
      .delete(`/tasks/${item.id}/`)
      .then((res) => this.refreshList());
  };
  
  createItem = () => {
    const item = { 
      name: "",
      description: "",
      deadline_time: "",
      deadline_date: "",
      state: "",
      assigned_to: "Not Selected",
      duration: ""
    };

    this.setState({ activeItem: item, modal: !this.state.modal });
  };

  editItem = (item) => {
    const item_validated = {
      id: item.id,
      name: item.name,
      description: item.description,
      deadline: item.deadline,
      deadline_time: moment(item.deadline).format('HH:mm'),
      deadline_date: moment(item.deadline).format('YYYY-MM-DD'),
      state: item.state,
      assigned_to: item.assigned_to,
      duration: item.duration,
    }
    this.setState({ activeItem: item_validated, modal: !this.state.modal });
  };

  displayState = (status) => {


    if (status === "NOT STARTED") {
      return this.setState({ viewState: "Not Started" });
    }

    if (status === "IN PROGRESS") {
      return this.setState({ viewState: "In Progress" });
    }

    if (status === "BLOCKED") {
      return this.setState({ viewState: "Blocked" });
    }

    if (status === "COMPLETED") {
      return this.setState({ viewState: "Completed" });
    }

    if (status === "SEARCH") {
      return this.setState({ viewState: "Search" });
    }


  };

  renderTabList = () => {
   
    return (
      
      <div className="tasks-navbar">
        <span
          onClick={() => this.displayState("NOT STARTED")}
          className={(this.state.viewState === "Not Started") ? "tasks-link active" : "tasks-link "}
        >
          Not Started
        </span>
        <span
          onClick={() => this.displayState("IN PROGRESS")}
          className={(this.state.viewState === "In Progress") ? "tasks-link active" : "tasks-link "}
        >
          In Progress
        </span>
        <span
          onClick={() => this.displayState("BLOCKED")}
          className={(this.state.viewState === "Blocked") ? "tasks-link active" : "tasks-link "}
        >
          Blocked
        </span>
        <span
          onClick={() => this.displayState("COMPLETED")}
          className={(this.state.viewState ==="Completed") ? "tasks-link active" : "tasks-link"}
        >
          Completed
        </span>
        <span
          onClick={() => this.displayState("SEARCH")}
          className={(this.state.viewState === "Search") ? "tasks-link active" : "tasks-link "}
        >
          Search
        </span>
      </div>
    );
  };


  showDeadline(item) {
    if (item.deadline === null){
      return ("No Deadline")
    } else {
      return (moment(item.deadline).format('DD MMM YYYY hh:mm a'))
    }
  }

  renderItems = () => {
    const {viewState} = this.state;
    //console.log(viewState);

    // Display the list of matching tasks after search
    let newItems;
    if (viewState === "Search") {
      newItems = this.state.matchingTasksList;
    } else {
      newItems = this.state.taskList.filter(
        (item) => item.state === viewState
      );
    }
    //console.log(newItems);

    if (newItems.length === 0) {
      if (this.state.viewState === "Search") {
        return (
          <div className="text-dblue text-center mt-4">No tasks found matching these search parameters</div>
        );
      } else {
        return (
          <div className="text-dblue text-center mt-4">No tasks to show with status: <b>{ this.state.viewState }</b></div>
        );
      }
    } else {
      return newItems.map((item) => (
        <li
          key={item.id}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <span
            className={`task-title mr-2 task-col ${this.state.viewState ? "completed-todo" : ""}`}
            title={item.description}
            
          >
            {item.name}
          </span>
          <span className="task-col">
            {this.showDeadline(item)}
          </span>
          <span className="task-col-button">
            <button
              className="btn btn-blue mr-2"
              onClick={() => this.editItem(item)}
            >
              Edit
            </button>
            <button
              className="btn btn-orange"
              onClick={() => this.handleDelete(item)}
            >
              Delete
            </button>
          </span>
        </li>
      ));
    }
  };

  getSearchedTasks = (searchParams) => {
    axiosInstance
      .post(`/tasks_search/`, {
        name:         searchParams.name,
        description:  searchParams.description,
        id:           searchParams.id,
        start_date:   searchParams.start_date,
        end_date:     searchParams.end_date,
      })
      .then((res) => this.setState({ matchingTasksList : res.data }))
      .catch((err) => console.log(err));

      // console.log("this.state.matchingTasksList");
      // console.log(this.state.matchingTasksList);
      
      this.displayState("SEARCH");
  };


  renderProgressBar() {
    let total = this.state.workload

    if(total <= 100){
      return(
        <ProgressBar>
            <ProgressBar striped variant="success" now={total} max="150" label={`${total}%`}/>
        </ProgressBar>
      )
    } else if ((total > 100)&&(total <= 125)) {
      let diff = total - 100;
        return(
          <ProgressBar>
              <ProgressBar striped variant="success" now={90} key={1} max="150"/>
              <ProgressBar striped variant="warning" now={diff} key={2} max="150" label={`${total}%`}/>
          </ProgressBar>
        );
    } else {
      let diff = total - 125;
        return(
          <ProgressBar>
              <ProgressBar striped variant="success" now={90} key={1} max="150"/>
              <ProgressBar striped variant="warning" now={30} key={2} max="150"/>
              <ProgressBar striped variant="danger" now={diff} key={3} max="150" label={`${total}%`}/>
          </ProgressBar>
        )
    }
  }

  render() {
  
    return (
      <div>
        <div className="col-md-9 col-sm-10 mx-auto p-0">
          <div className="mb-4">
            <p className ="text-dblue">Workload</p>
            {this.renderProgressBar()}
          </div>
        </div>

        <div className="row mb-2">
          <div className="col-md-9 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="mb-2">

                <SearchBar
                  onSave={this.getSearchedTasks}
                />

              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-9 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              <div className="mb-4">
                <button
                  className="btn btn-blue"
                  onClick={this.createItem}
                >
                  Add task
                </button>
              </div>
              {this.renderTabList()}
              <ul className="list-group list-group-flush border-top-0">
                {this.renderItems()}
              </ul>
            </div>
          </div>
        </div>
        {this.state.modal ? (
          <Modal
            activeItem={this.state.activeItem}
            toggle={this.toggle}
            onSave={this.handleSubmit}
            data={this.props.data}
          />
        ) : null}


      </div>
    );
  }
}